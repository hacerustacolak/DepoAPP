using Depo.Api.Model.Common;
using Depo.Data.Models;
using Depo.Data.Models.Attributes;
using Depo.Data.Models.Common;
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

namespace Depo.Api.Controllers.Definitions
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class CompetitorController : ControllerBase
    {
        private readonly DepoDbContext _context;

        public CompetitorController(DepoDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [PermissionRequirement(only: "canReadCompetitor")]
        public async Task<DepoApiResponse> GetAll()
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            try
            {
                var result = await(from r in _context.Competitors.Where(p => !p.IsDeleted)
                                  orderby r.CompetitorName
                            select new Competitors()
                            {
                                Id = r.Id,
                                CompetitorName = r.CompetitorName,
                            }).ToListAsync();

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
        [PermissionRequirement(only: "canReadCompetitor")]
        public async Task<DepoApiResponse> Find([FromHeader] QueryParam<FilterQuery> queryParam)
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            int pageSize = queryParam.PageSize;
            int pageNumber = queryParam.PageNumber;
            var filter = queryParam.FilterData;

            try
            {
                var query = from r in _context.Competitors.Where(p => !p.IsDeleted)
                            select new Competitors()
                            {
                                Id = r.Id,
                                CompetitorName = r.CompetitorName,
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
                        query = query.Where(u => u.CompetitorName.Contains(filter.SearchText)
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
        [PermissionRequirement(only: "canCreateCompetitor")]
        public async Task<DepoApiResponse> Create(Competitors competitor)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (string.IsNullOrEmpty(competitor.CompetitorName))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    competitor.CompetitorName = competitor.CompetitorName.Trim();
                }

                var existsName = await _context.Competitors.AnyAsync(x => !x.IsDeleted && x.CompetitorName == competitor.CompetitorName);
                if (existsName)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }

                competitor.IsActive = true;
                competitor.CreateDate = DateTime.UtcNow;
                competitor.CreatorUserId = Utility.GetCurrentUser(User).Id;
                competitor.ModifiedDate = DateTime.UtcNow;
                await _context.Competitors.AddAsync(competitor);

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
        [PermissionRequirement(only: "canUpdateCompetitor")]
        public async Task<DepoApiResponse> Update(long id, Competitors competitor)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (id != competitor.Id)
                {
                    res.Message = "BAD_REQUEST";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var updatedModel = await _context.Competitors.Where(x => x.Id == id).FirstOrDefaultAsync();

                if (updatedModel == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (string.IsNullOrEmpty(competitor.CompetitorName))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    competitor.CompetitorName = competitor.CompetitorName.Trim();
                }

                var existsCompetitorName = _context.Competitors.Any(x => !x.IsDeleted && x.CompetitorName == competitor.CompetitorName && x.Id != id);
                if (existsCompetitorName)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_RegionName";
                    Console.WriteLine(res.Message);
                    return res;
                }

                updatedModel.CompetitorName = competitor.CompetitorName;
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
        [PermissionRequirement(only: "canDeleteCompetitor")]
        public async Task<DepoApiResponse> Delete(long id)
        {
            var res = new DepoApiResponse(false);

            try
            {

                var competitor = await _context.Competitors.FindAsync(id);
                if (competitor == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                competitor.ModifiedDate = DateTime.UtcNow;
                competitor.ModifierUserId = Utility.GetCurrentUser(User).Id;
                competitor.IsDeleted = true;
                _context.Competitors.Update(competitor);

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
