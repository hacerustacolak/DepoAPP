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
    public class UserHierarchiesController : ControllerBase
    {
        private readonly DepoDbContext _context;
        private readonly AppSettings _appSettings;
        private readonly EmailConfig _emailConfig;

        public UserHierarchiesController(DepoDbContext context, AppSettings appSettings, EmailConfig emailConfig)
        {
            _context = context;
            _appSettings = appSettings;
            _emailConfig = emailConfig;
        }


        [HttpGet("{id}")]
        [PermissionRequirement(only: "canReadUser")]
        public async Task<DepoApiResponse> GetUserHierarchies(long id)
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            try
            {
                var hierarchies = await _context.Hierarchies.Where(x => x.IsActive && !x.IsDeleted).Select(x => new UserHierarchiesViewModel
                {
                    Id = x.Id,
                    ParentId = x.ParentId,
                    Title = x.Title,
                    Selected = _context.UserHierarchies.Where(ur => !ur.IsDeleted && ur.HierarchyId == x.Id && ur.UserId == id).Any()
                })
                 .OrderByDescending(p => p.Id)
                 .ToListAsync();

                var query = hierarchies.Where(p => p.ParentId == 0).Select(x => new UserHierarchiesViewModel
                {
                    Id = x.Id,
                    ParentId = x.ParentId,
                    Title = x.Title,
                    Selected = x.Selected,
                    ChildList = getChild(hierarchies, x.Id)
                });


                query = query.OrderByDescending(o => o.Id);

                res = new DepoApiResponse(true);
                res.Data = query.ToList();
                return res;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
                return res;
            }
        }

        [HttpPost]
        [PermissionRequirement(only: "canUpdateUser")]
        public async Task<DepoApiResponse> UpdateUserHierarchies(UserHierarchyModel model)
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            try
            {
                _context.UserHierarchies.RemoveRange(_context.UserHierarchies.Where(x => x.UserId == model.UserId));

                if (model.Hierarchies.Any())
                {
                    foreach (var hierarchyId in model.Hierarchies)
                    {
                        await _context.UserHierarchies.AddAsync(new UserHierarchies
                        {
                            HierarchyId = hierarchyId,
                            UserId = model.UserId,
                            CreateDate = DateTime.UtcNow,
                            CreatorUserId = usr.Id
                        });
                    }
                }

                var result = await _context.SaveChangesAsync();
                if (result > 0)
                    res = new DepoApiResponse(true, "USER_HIERARCHIES_UPDATED");

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
            }

            return res;
        }

        private List<UserHierarchiesViewModel> getChild(List<UserHierarchiesViewModel> hierarchies, long parentId)
        {

            try
            {
                var query = hierarchies.Where(x => x.ParentId == parentId).Select(x => new UserHierarchiesViewModel
                {
                    Id = x.Id,
                    ParentId = x.ParentId,
                    Title = x.Title,
                    Selected = x.Selected,
                    ChildList = getChild(hierarchies, x.Id)
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
