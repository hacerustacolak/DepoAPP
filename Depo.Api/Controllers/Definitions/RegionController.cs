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
    public class RegionController : ControllerBase
    {
        private readonly DepoDbContext _context;

        public RegionController(DepoDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [PermissionRequirement(only: "canReadRegion")]
        public async Task<DepoApiResponse> GetAll()
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            try
            {
                var result = await _context.Region.Where(p => !p.IsDeleted && p.IsActive).ToListAsync();

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
        [PermissionRequirement(only: "canReadRegion")]
        public async Task<DepoApiResponse> Find([FromHeader] QueryParam<FilterQuery> queryParam)
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            int pageSize = queryParam.PageSize;
            int pageNumber = queryParam.PageNumber;
            var filter = queryParam.FilterData;

            try
            {
                var query = from r in _context.Region.Where(p => !p.IsDeleted)
                            select new RegionView()
                            {
                                Id = r.Id,
                                Address = r.Address,
                                PhoneNumber = r.PhoneNumber,
                                RegionName = r.RegionName,
                                IsActive = r.IsActive,
                                CityId = r.CityId
                            };

                if (filter != null)
                {
                    if (filter.Status.HasValue)
                    {
                        query = query.Where(a => a.IsActive == filter.Status);
                    }

                    if (!string.IsNullOrEmpty(filter.SearchText))
                    {
                        query = query.Where(u => u.RegionName.Contains(filter.SearchText)
                        || u.CityName.Contains(filter.SearchText)
                        || u.CityPlateCode.ToString().Contains(filter.SearchText)
                        || u.PhoneNumber.Contains(filter.SearchText)
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
        [PermissionRequirement(only: "canCreateRegion")]
        public async Task<DepoApiResponse> Create(Region region)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (string.IsNullOrEmpty(region.RegionName))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    region.RegionName = region.RegionName.Trim();
                }


                if (region.CityId == null || region.CityId.Count <= 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_City";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                    region.strCityIds = String.Join(',', region.CityId);

                if (!Utility.PhoneRegexValidator(region.PhoneNumber))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "PhoneNumber_IS_WRONG_TYPE";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var existsName = await _context.Region.AnyAsync(x => !x.IsDeleted && x.RegionName == region.RegionName);
                if (existsName)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }

                region.IsActive = true;
                region.CreateDate = DateTime.UtcNow;
                region.CreatorUserId = Utility.GetCurrentUser(User).Id;

                await _context.Region.AddAsync(region);

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
        [PermissionRequirement(only: "canUpdateRegion")]
        public async Task<DepoApiResponse> Update(long id, Region region)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (id != region.Id)
                {
                    res.Message = "BAD_REQUEST";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var updatedModel = await _context.Region.Where(x => x.Id == id).FirstOrDefaultAsync();

                if (updatedModel == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (string.IsNullOrEmpty(region.RegionName))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    region.RegionName = region.RegionName.Trim();
                }

                if (!string.IsNullOrEmpty(region.PhoneNumber))
                {
                    if (!Utility.PhoneRegexValidator(region.PhoneNumber))
                    {
                        res.Type = DepoApiMessageType.Form;
                        res.Message = "PHONE_IS_WRONG_TYPE";
                        Console.WriteLine(res.Message);
                        return res;
                    }
                }

                if (region.CityId == null || region.CityId.Count <= 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_City";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                    region.strCityIds = String.Join(',', region.CityId);

                var existsRegionName = _context.Region.Any(x => !x.IsDeleted && x.RegionName == region.RegionName && x.Id != id);
                if (existsRegionName)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_RegionName";
                    Console.WriteLine(res.Message);
                    return res;
                }                

                updatedModel.RegionName = region.RegionName;
                updatedModel.strCityIds = region.strCityIds;
                updatedModel.PhoneNumber = region.PhoneNumber;
                updatedModel.Address = region.Address;
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
        [PermissionRequirement(only: "canDeleteRegion")]
        public async Task<DepoApiResponse> Delete(long id)
        {
            var res = new DepoApiResponse(false);

            try
            {

                var region = await _context.Region.FindAsync(id);
                if (region == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                region.ModifiedDate = DateTime.UtcNow;
                region.ModifierUserId = Utility.GetCurrentUser(User).Id;
                region.IsDeleted = true;
                _context.Region.Update(region);

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
