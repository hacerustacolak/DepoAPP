using Depo.Api.Model.Common;
using Depo.Data.Models;
using Depo.Data.Models.Attributes;
using Depo.Data.Models.Common;
using Depo.Data.Models.Extension;
using Depo.Data.Models.Security;
using Depo.Data.Models.Utility;
using MailKit.Net.Smtp;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Depo.Api.Controllers.Security
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserRolesController : ControllerBase
    {
        private readonly DepoDbContext _context;

        public UserRolesController(DepoDbContext context)
        {
            _context = context;
        }

        [HttpGet("{id}")]
        [PermissionRequirement(only: "canReadUser")]
        public async Task<DepoApiResponse> GetUserRole(long id)
        {
            var res = new DepoApiResponse(false);

            try
            {
                var result = await _context.Roles.Where(cr => !cr.IsDeleted)
                .Select(role => new UserRoleViewModel
                {
                    Id = role.Id,
                    Name = role.RoleName,
                    Selected = _context.UserRoles.Where(ur => !ur.IsDeleted && ur.RoleId == role.Id && ur.UserId == id).Any()
                }).ToListAsync();

                res = new DepoApiResponse(true);
                res.Data = result;
                return res;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Message = "Unexpected Error";
                return res;
            }
        }

        [HttpPost]
        [PermissionRequirement(only: "canUpdateUser")]
        public async Task<DepoApiResponse> UpdateUserRoles(UserRoleModel model)
        {
            var res = new DepoApiResponse(false);

            try
            {
                _context.UserRoles.RemoveRange(_context.UserRoles.Where(x => x.UserId == model.UserId));

                if (model.Roles.Any())
                {
                    foreach (var roleId in model.Roles)
                    {
                        await _context.UserRoles.AddAsync(new UserRole
                        {
                            RoleId = roleId,
                            UserId = model.UserId,
                            CreateDate = DateTime.UtcNow,
                            CreatorUserId = Utility.GetCurrentUser(User).Id
                        });
                    }

                    await _context.SaveChangesAsync();
                    res = new DepoApiResponse(true);
                    res.Message = "USER_ROLES_UPDATED";
                    return res;
                }
                else
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ROLE_REQUIRED";
                    Console.WriteLine(res.Message);
                    return res;
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
                res.Message = "Unexpected Error";
                return res;
            }
        }

        [HttpGet("finance")]
        [PermissionRequirement(only: "canReadUser")]
        public async Task<DepoApiResponse> GetUserRoleOfFinance()
        {
            var res = new DepoApiResponse(false);

            try
            {
                var result = await (from u in _context.UserRoles.Where(p => !p.IsDeleted)
                                     join role in _context.Roles.Where(p => !p.IsDeleted) on u.RoleId equals role.Id
                                     join user in _context.Users.Where(p => !p.IsDeleted) on u.UserId equals user.Id
                                     where role.RoleName.ToLower().Contains("finance") || role.RoleName.ToLower().Contains("finans")
                                    select new User()
                                     {
                                         Name = user.Name,
                                         Id = user.Id,
                                         Surname = user.Surname,
                                     }
                                     ).ToListAsync();

                res = new DepoApiResponse(true);
                res.Data = result;
                return res;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Message = "Unexpected Error";
                return res;
            }
        }


    }
}
