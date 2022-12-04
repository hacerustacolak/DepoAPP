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
    public class RolesController : ControllerBase
    {
        private readonly DepoDbContext _context;
        private readonly AppSettings _appSettings;
        private readonly EmailConfig _emailConfig;

        public RolesController(DepoDbContext context, AppSettings appSettings, EmailConfig emailConfig)
        {
            _context = context;
            _appSettings = appSettings;
            _emailConfig = emailConfig;
        }


        [HttpGet("{id}")]
        [PermissionRequirement(only: "canReadRole")]
        public async Task<DepoApiResponse> GetRole(long id)
        {
            var res = new DepoApiResponse(false);
           
            try
            {
                var roles = await _context.Roles.FindAsync(id);

                if (roles == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    return res;
                }

                res = new DepoApiResponse(true);
                res.Data = roles;

                return res;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return res;
            }
        }

        [HttpGet("find")]
        [PermissionRequirement(only: "canReadRole")]
        public async Task<DepoApiResponse> Find([FromHeader] QueryParam<FilterQuery> queryParam)
        {
            var res = new DepoApiResponse(false);

            int pageSize = queryParam.PageSize;
            int pageNumber = queryParam.PageNumber;
            var filter = queryParam.FilterData;

            try
            {
                var query = _context.Roles.Where(p => !p.IsDeleted);

                if (filter != null)
                {
                    if (filter.Status.HasValue)
                    {
                        query = query.Where(a => a.IsActive == filter.Status);
                    }

                    if (!string.IsNullOrEmpty(filter.SearchText))
                    {
                        query = query.Where(u => u.RoleName.Contains(filter.SearchText)
                        || u.RolePermissions.Contains(filter.SearchText)
                        );
                    }
                }

                query = query.OrderByDescending(o => o.Id);

                var result = await query.ToPagedListAsync(pageNumber, pageSize);

                res = new DepoApiResponse(true);
                res.Data = result;

                return res;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return res;
            }
        }

        [HttpPut("{id}")]
        [PermissionRequirement(only: "canUpdateRole")]
        public async Task<DepoApiResponse> Update(int id, Role role)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (id != role.Id)
                {
                    res.Message = "Role Not Found";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var updatedModel = _context.Roles.Where(x => x.Id == id).FirstOrDefault();

                if (updatedModel == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var existsRole = _context.Roles.Any(x => !x.IsDeleted && x.RoleName == role.RoleName && x.Id != updatedModel.Id);
                if (existsRole)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }

                updatedModel.RoleName = role.RoleName;
                updatedModel.RolePermissions = role.RolePermissions;
                updatedModel.ModifiedDate = DateTime.UtcNow;
                updatedModel.ModifierUserId = Utility.GetCurrentUser(User).Id;

                _context.Entry(updatedModel).State = EntityState.Modified;

                var result = await _context.SaveChangesAsync();
                if (result > 0)
                {
                    res = new DepoApiResponse(true);
                    res.Message = "RECORD_SUCCESSFULLY_UPDATED";
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
            }
            finally
            {

            }

            return res;
        }

        [HttpPost]
        [PermissionRequirement(only: "canCreateRole")]
        public async Task<DepoApiResponse> Create(Role role)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (string.IsNullOrEmpty(role.RoleName))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_ROLE_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                    role.RoleName = role.RoleName.Trim();

                var existsRole = _context.Roles.Any(x => !x.IsDeleted && x.RoleName == role.RoleName);
                if (existsRole)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }

                role.CreateDate = DateTime.UtcNow;
                role.CreatorUserId = Utility.GetCurrentUser(User).Id;

                _context.Roles.Add(role);

                var result = await _context.SaveChangesAsync();
                if (result > 0)
                {
                    res = new DepoApiResponse(true);
                    res.Message = "RECORD_SUCCESSFULLY_CREATED";
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
            }
            finally
            {

            }

            return res;
        }

        [HttpDelete("{id}")]
        [PermissionRequirement(only: "canDeleteRole")]
        public async Task<DepoApiResponse> Delete(long id)
        {
            var res = new DepoApiResponse(false);

            try
            {
                var role = await _context.Roles.FindAsync(id);
                if (role == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                role.ModifiedDate = DateTime.UtcNow;
                role.ModifierUserId = Utility.GetCurrentUser(User).Id;
                role.IsDeleted = true;
                _context.Roles.Update(role);

                var result = await _context.SaveChangesAsync();
                if (result > 0)
                    res = new DepoApiResponse(true, "RECORD_SUCCESSFULLY_DELETED");

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
            }

            return res;
        }

    }
}
