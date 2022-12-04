using Depo.Api.Model.Common;
using Depo.Data.Models;
using Depo.Data.Models.Attributes;
using Depo.Data.Models.Common;
using Depo.Data.Models.Crm;
using Depo.Data.Models.Definitions;
using Depo.Data.Models.Extension;
using Depo.Data.Models.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Depo.Api.Controllers.Crm
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class GroupController : ControllerBase
    {
        private readonly DepoDbContext _context;

        public GroupController(DepoDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [PermissionRequirement(only: "canReadGroup")]
        public async Task<DepoApiResponse> GetAll()
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            try
            {
                var result = await (from r in _context.Group.Where(p => !p.IsDeleted)
                            select new Group()
                            {
                                Id = r.Id,
                                Name = r.Name,
                            }).ToListAsync().ConfigureAwait(false);

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

        [HttpGet("find")]
        [PermissionRequirement(only: "canReadGroup")]
        public async Task<DepoApiResponse> Find([FromHeader] QueryParam<FilterQuery> queryParam)
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            int pageSize = queryParam.PageSize;
            int pageNumber = queryParam.PageNumber;
            var filter = queryParam.FilterData;

            try
            {
                var query = from r in _context.Group.Where(p => !p.IsDeleted)
                            select new Group()
                            {
                                Id = r.Id,
                                Name = r.Name,
                                CreateDate = r.CreateDate,
                                ModifiedDate = r.ModifiedDate,
                            };

                if (filter != null)
                {
                    if (filter.Status.HasValue)
                    {
                        query = query.Where(a => a.IsActive == filter.Status);
                    }

                    if (!string.IsNullOrEmpty(filter.SearchText))
                    {
                        query = query.Where(u => u.Name.Contains(filter.SearchText)
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

        [HttpPost]
        [PermissionRequirement(only: "canCreateGroup")]
        public async Task<DepoApiResponse> Create(Group group)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (string.IsNullOrEmpty(group.Name))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    group.Name = group.Name.Trim();
                }

                var existsName = await _context.Group.AnyAsync(x => !x.IsDeleted && x.Name == group.Name);
                if (existsName)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }

                group.IsActive = true;
                group.CreateDate = DateTime.UtcNow;
                group.CreatorUserId = Utility.GetCurrentUser(User).Id;
                group.ModifiedDate = DateTime.UtcNow;
                await _context.Group.AddAsync(group);

                var result = await _context.SaveChangesAsync();
                if (result > 0)
                    res = new DepoApiResponse(true, "RECORD_SUCCESSFULLY_CREATED");

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
            }

            return res;
        }

        [HttpPut("{id}")]
        [PermissionRequirement(only: "canUpdateGroup")]
        public async Task<DepoApiResponse> Update(long id, Group group)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (id != group.Id)
                {
                    res.Message = "BAD_REQUEST";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var updatedModel = await _context.Group.Where(x => x.Id == id).FirstOrDefaultAsync();

                if (updatedModel == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (string.IsNullOrEmpty(group.Name))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    group.Name = group.Name.Trim();
                }

                var existsCompetitorName = _context.Group.Any(x => !x.IsDeleted && x.Name == group.Name && x.Id != id);
                if (existsCompetitorName)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_RegionName";
                    Console.WriteLine(res.Message);
                    return res;
                }

                updatedModel.Name = group.Name;
                updatedModel.ModifiedDate = DateTime.UtcNow;
                updatedModel.ModifierUserId = Utility.GetCurrentUser(User).Id;

                _context.Entry(updatedModel).State = EntityState.Modified;

                var result = await _context.SaveChangesAsync();
                if (result > 0)
                    res = new DepoApiResponse(true, "RECORD_SUCCESSFULLY_UPDATED");

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
            }

            return res;
        }

        [HttpDelete("{id}")]
        [PermissionRequirement(only: "canDeleteGroup")]
        public async Task<DepoApiResponse> Delete(long id)
        {
            var res = new DepoApiResponse(false);

            try
            {

                var group = await _context.Group.FindAsync(id);
                if (group == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                group.ModifiedDate = DateTime.UtcNow;
                group.ModifierUserId = Utility.GetCurrentUser(User).Id;
                group.IsDeleted = true;
                _context.Group.Update(group);

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
