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
    public class HierarchiesController : ControllerBase
    {
        private readonly DepoDbContext _context;
        private readonly AppSettings _appSettings;
        private readonly EmailConfig _emailConfig;

        public HierarchiesController(DepoDbContext context, AppSettings appSettings, EmailConfig emailConfig)
        {
            _context = context;
            _appSettings = appSettings;
            _emailConfig = emailConfig;
        }


        [HttpGet]
        [PermissionRequirement(only: "canReadHierarchy")]
        public async Task<DepoApiResponse> GetHierarchies()
        {
            var res = new DepoApiResponse(false);

            try
            {
                var result = await _context.Hierarchies.Where(w => !w.IsDeleted).ToListAsync();

                res = new DepoApiResponse(true);
                res.Data = result;
                return res;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
                return res;
            }
        }

        [HttpGet("find")]
        [PermissionRequirement(only: "canReadHierarchy")]
        public async Task<DepoApiResponse> Find([FromHeader] QueryParam<HierarchiesQuery> queryParam)
        {
            var res = new DepoApiResponse(false);

            try
            {
                var hierarchies = await _context.Hierarchies.Where(x => x.IsActive && !x.IsDeleted).Select(x => new HierarchiesModel
                {
                    Id = x.Id,
                    ParentId = x.ParentId,
                    Title = x.Title,
                    TitleDescription = x.TitleDescription
                })
                 .OrderByDescending(p => p.Id)
                 .ToListAsync();

                var query = hierarchies.Where(p => p.ParentId == 0).Select(x => new HierarchiesModel
                {
                    Id = x.Id,
                    ParentId = x.ParentId,
                    Title = x.Title,
                    TitleDescription = x.TitleDescription,
                    xlHierarchiesModel = getChild(hierarchies, x.Id)
                });


                query = query.OrderByDescending(o => o.Id);


                var result = await query.ToPagedListAsync(0, 100000);

                res = new DepoApiResponse(true);
                res.Data = result;
                return res;

            }

            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
                return res;
            }
        }

        [HttpPut("{id}")]
        [PermissionRequirement(only: "canUpdateHierarchy")]
        public async Task<DepoApiResponse> Update(int id, Hierarchies hierarchy)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (id != hierarchy.Id)
                {
                    res.Message = "BAD_REQUEST";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var updatedModel = _context.Hierarchies.Where(x => x.Id == id).FirstOrDefault();

                if (updatedModel == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var existsHierarchy = _context.Hierarchies.Any(x => !x.IsDeleted && x.ParentId == hierarchy.ParentId && x.Title == hierarchy.Title && x.Id != updatedModel.Id);
                if (existsHierarchy)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }

                updatedModel.Title = hierarchy.Title;
                updatedModel.TitleDescription = hierarchy.TitleDescription;
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

        [HttpPost]
        [PermissionRequirement(only: "canCreateHierarchy")]
        public async Task<DepoApiResponse> Create(Hierarchies hierarchy)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (string.IsNullOrEmpty(hierarchy.Title))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_ROLE_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    hierarchy.Title = hierarchy.Title.Trim();
                }

                var existsHierarchy = _context.Hierarchies.Any(x => !x.IsDeleted && x.ParentId == hierarchy.ParentId && x.Title == hierarchy.Title);
                if (existsHierarchy)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }

                hierarchy.CreateDate = DateTime.UtcNow;
                hierarchy.CreatorUserId = Utility.GetCurrentUser(User).Id;

                _context.Hierarchies.Add(hierarchy);

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

        [HttpDelete("{id}")]
        [PermissionRequirement(only: "canDeleteHierarchy")]
        public async Task<DepoApiResponse> Delete(int id)
        {
            var res = new DepoApiResponse(false);

            try
            {
                var hierarchies = await _context.Hierarchies.Where(x => x.IsActive && !x.IsDeleted).ToListAsync();
                if (!hierarchies.Any(p => p.Id == id))
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var deletion = hierarchies.Where(p => p.Id == id).SelectManyRecursive(p => getChildForDelete(hierarchies, p.Id)).ToList();

                foreach (var item in deletion)
                {
                    item.ModifiedDate = DateTime.UtcNow;
                    item.ModifierUserId = Utility.GetCurrentUser(User).Id;
                    item.IsDeleted = true;
                    _context.Hierarchies.Update(item);
                }

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

        private List<Hierarchies> getChildForDelete(List<Hierarchies> hierarchies, long parentId)
        {
            
                try
                {
                    var query = hierarchies.Where(x => x.ParentId == parentId);
                    var result = query.ToList();

                    return result;
                }
                catch (Exception ex)
                {
                    Console.WriteLine(ex);
                    return null;
                }
        }

        private List<HierarchiesModel> getChild(List<HierarchiesModel> hierarchies, long parentId)
        {
            try
            {
                var query = hierarchies.Where(x => x.ParentId == parentId).Select(x => new HierarchiesModel
                {
                    Id = x.Id,
                    ParentId = x.ParentId,
                    Title = x.Title,
                    TitleDescription = x.TitleDescription,
                    xlHierarchiesModel = getChild(hierarchies, x.Id)
                });

                query = query.OrderByDescending(o => o.Id);

                var result = query.ToList();

                return result;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return null;
            }
        }

    }
}
