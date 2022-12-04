using Depo.Api.Model.Common;
using Depo.Data.Models;
using Depo.Data.Models.Attributes;
using Depo.Data.Models.Common;
using Depo.Data.Models.Extension;
using Depo.Data.Models.Utility;
using Depo.Data.Models.Vehicle;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Depo.Api.Controllers.Vehicle
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class VehicleModelController : ControllerBase
    {
        private readonly DepoDbContext _context;

        public VehicleModelController(DepoDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [PermissionRequirement(only: "canReadVehicleModel")]
        public async Task<DepoApiResponse> GetAllModels()
        {
            var res = new DepoApiResponse(false);
            try
            {
                var cities = await _context.VehicleModel.Where(x => x.IsActive && !x.IsDeleted).OrderBy(p => p.ModelName).ToListAsync();

                res = new DepoApiResponse(true);
                res.Data = cities.ToList();
                return res;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
                return res;
            }
        }

        [HttpGet("{brandId}")]
        [PermissionRequirement(only: "canReadVehicleModel")]
        public async Task<DepoApiResponse> GetAllModelsByBrandId(long brandId)
        {
            var res = new DepoApiResponse(false);
            try
            {
                var cities = await _context.VehicleModel.Where(x => x.IsActive && !x.IsDeleted && x.VehicleBrandId == brandId).OrderBy(p => p.ModelName).ToListAsync();

                res = new DepoApiResponse(true);
                res.Data = cities.ToList();
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
        [PermissionRequirement(only: "canReadVehicleModel")]
        public async Task<DepoApiResponse> Find([FromHeader] QueryParam<FilterQuery> queryParam)
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            int pageSize = queryParam.PageSize;
            int pageNumber = queryParam.PageNumber;
            var filter = queryParam.FilterData;

            try
            {
                var query = from vm in _context.VehicleModel.Where(p => !p.IsDeleted)
                            join vb in _context.VehicleBrand.Where(p => !p.IsDeleted) on vm.VehicleBrandId equals vb.Id
                            select new VehicleModel()
                            {
                                Id = vm.Id,
                                ModelName = vm.ModelName,
                                Description = vm.Description,
                                ModifiedDate = vm.ModifiedDate,
                                VehicleBrandId = vm.VehicleBrandId,
                                VehicleBrandName = vb.BrandName,
                                MaintenancePeriodKM = vm.MaintenancePeriodKM,
                                MaintenancePeriodYear = vm.MaintenancePeriodYear,
                            };

                if (filter != null)
                {
                    if (filter.Status.HasValue)
                    {
                        query = query.Where(a => a.IsActive == filter.Status);
                    }

                    if (!string.IsNullOrEmpty(filter.SearchText))
                    {
                        query = query.Where(u => u.ModelName.Contains(filter.SearchText)
                        || u.Description.Contains(filter.SearchText)
                        || u.VehicleBrandName.Contains(filter.SearchText)
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
        [PermissionRequirement(only: "canCreateVehicleModel")]
        public async Task<DepoApiResponse> Create(VehicleModel model)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (string.IsNullOrEmpty(model.ModelName))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    model.ModelName = model.ModelName.Trim();
                }

                var existsName = await _context.VehicleModel.AnyAsync(x => !x.IsDeleted && x.ModelName == model.ModelName);
                if (existsName)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var existsBrand = _context.VehicleBrand.Any(x => !x.IsDeleted && x.Id == model.VehicleBrandId);
                if (!existsBrand)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "BRAND_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                model.IsActive = true;
                model.CreateDate = DateTime.UtcNow;
                model.CreatorUserId = Utility.GetCurrentUser(User).Id;
                model.ModifiedDate = DateTime.UtcNow;
                await _context.VehicleModel.AddAsync(model);

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
        [PermissionRequirement(only: "canUpdateVehicleModel")]
        public async Task<DepoApiResponse> Update(long id, VehicleModel model)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (id != model.Id)
                {
                    res.Message = "BAD_REQUEST";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var updatedModel = await _context.VehicleModel.Where(x => x.Id == id).FirstOrDefaultAsync();

                if (updatedModel == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (string.IsNullOrEmpty(model.ModelName))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    model.ModelName = model.ModelName.Trim();
                }

                var existsName = _context.VehicleModel.Any(x => !x.IsDeleted && x.ModelName == model.ModelName && x.Id != id);
                if (existsName)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var existsBrand = _context.VehicleBrand.Any(x => !x.IsDeleted && x.Id == model.VehicleBrandId);
                if (!existsBrand)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "BRAND_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                updatedModel.ModelName = model.ModelName;
                updatedModel.VehicleBrandId = model.VehicleBrandId;
                updatedModel.ModifiedDate = DateTime.UtcNow;
                updatedModel.ModifierUserId = Utility.GetCurrentUser(User).Id;
                updatedModel.Description = model.Description;
                updatedModel.MaintenancePeriodYear = model.MaintenancePeriodYear;
                updatedModel.MaintenancePeriodKM = model.MaintenancePeriodKM;

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
        [PermissionRequirement(only: "canDeleteVehicleModel")]
        public async Task<DepoApiResponse> Delete(long id)
        {
            var res = new DepoApiResponse(false);

            try
            {

                var deletedModel = await _context.VehicleModel.FindAsync(id);
                if (deletedModel == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                deletedModel.ModifiedDate = DateTime.UtcNow;
                deletedModel.ModifierUserId = Utility.GetCurrentUser(User).Id;
                deletedModel.IsDeleted = true;
                _context.VehicleModel.Update(deletedModel);

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
