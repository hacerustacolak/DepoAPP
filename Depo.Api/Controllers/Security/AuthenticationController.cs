using Depo.Api.Model.Common;
using Depo.Data.Model;
using Depo.Data.Models;
using Depo.Data.Models.Common;
using Depo.Data.Models.Extension;
using Depo.Data.Models.Security;
using Depo.Data.Models.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Depo.Api.Controllers.Security
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AuthenticationController : ControllerBase
    {
        private readonly DepoDbContext _context;
        private readonly AppSettings _appSettings;
        private readonly EmailConfig _emailConfig;

        public AuthenticationController(DepoDbContext context, AppSettings appSettings, EmailConfig emailConfig)
        {
            _context = context;
            _appSettings = appSettings;
            _emailConfig = emailConfig;
        }


        [AllowAnonymous]
        [HttpPost("authenticate")]
        public async Task<DepoApiResponse> Authenticate([FromBody] User userParam)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (string.IsNullOrEmpty(userParam.Email) || string.IsNullOrEmpty(userParam.Password))
                {
                    res.Message = "Email and password required";
                    res.Data = new
                    {
                        PasswordExpired = false
                    };

                    return res;
                }

                userParam.Email = userParam.Email.Trim();
                userParam.Password = userParam.Password.Trim();

                var authUser = await (from u in _context.Users
                                      where u.IsActive && !u.IsDeleted && u.Email.Equals(userParam.Email)
                                      select u).FirstOrDefaultAsync();

                if (authUser == null || !BCrypt.Net.BCrypt.Verify(userParam.Password, authUser.PasswordHash))
                {
                    res.Message = "Email and password incorrect";

                    if (authUser != null)
                    {
                        authUser.FailAttempCount++;
                        authUser.ModifiedDate = DateTime.UtcNow;

                        if(authUser.FailAttempCount > 3)
                        {
                            res.Message = "Tried wrong Email or Password many time and user has blocked. Please change your password :)";
                            authUser.IsActive = false;
                            authUser.PasswordUpdateDate = DateTime.UtcNow.AddDays(-120);
                        }

                        _context.Users.Update(authUser);
                        await _context.SaveChangesAsync();
                    }
                    
                    res.Data = new
                    {
                        PasswordExpired = false
                    };

                    return res;
                }

                authUser.FailAttempCount = 0;

                if ((DateTime.UtcNow - authUser.PasswordUpdateDate).Days >= 90)
                {
                    res.Message = "Your password has expired, change your password.";
                    res.Data = new
                    {
                        PasswordExpired = true
                    };

                    return res;
                }

                var userRoles = (from ur in _context.UserRoles
                                 join r in _context.Roles on ur.UserId equals authUser.Id
                                 where ur.RoleId == r.Id
                                 select r);


                var tokenHandler = new JwtSecurityTokenHandler();
                var key = Encoding.ASCII.GetBytes(_appSettings.Secret);

                var claims = new List<Claim>();
                claims.Add(new Claim(DepoClaimTypes.Id, authUser.Id.ToString()));
                claims.Add(new Claim(DepoClaimTypes.Name, authUser.Name + " " + authUser.Surname));
                claims.Add(new Claim(DepoClaimTypes.Email, authUser.Email));
                claims.AddRange(userRoles.Select(s => new Claim(DepoClaimTypes.Role, s.RoleName)));
                claims.Add(new Claim(DepoClaimTypes.Version, _appSettings.Version));

                var permissions = new List<string>();
                foreach (var role in userRoles)
                {
                    if (!string.IsNullOrEmpty(role.RolePermissions))
                    {
                        var rolePermissions = role.RolePermissions.Split(',');
                        foreach (var permission in rolePermissions)
                        {
                            if (permissions.Contains(permission))
                                continue;

                            permissions.Add(permission);
                        }
                    }
                }
                claims.AddRange(permissions.Select(p => new Claim(DepoClaimTypes.Permission, p)));

                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims),
                    SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                };

                tokenHandler.TokenLifetimeInMinutes = 60 * 12;

                var token = tokenHandler.CreateToken(tokenDescriptor);
                string Token = tokenHandler.WriteToken(token);

                res = new DepoApiResponse(true);

                res.Data = new AccessData
                {
                    AccessToken = Token
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }

            return res;
        }
    }
}
