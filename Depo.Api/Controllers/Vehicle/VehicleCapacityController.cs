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
    public class VehicleCapacityController : ControllerBase
    {
        private readonly DepoDbContext _context;

        public VehicleCapacityController(DepoDbContext context)
        {
            _context = context;
        }

        [HttpGet("type")]
        [PermissionRequirement(only: "canReadVehicleCapacity")]
        public async Task<DepoApiResponse> GetAllType()
        {
            var res = new DepoApiResponse(false);
            try
            {
                var cities = await _context.VehicleType.Where(x => x.IsActive && !x.IsDeleted).OrderBy(p => p.TypeName).ToListAsync();

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

        [HttpGet]
        [PermissionRequirement(only: "canReadVehicleCapacity")]
        public async Task<DepoApiResponse> GetAllCapacity()
        {
            var res = new DepoApiResponse(false);
            try
            {
                var cities = await _context.VehicleCapacity.Where(x => x.IsActive && !x.IsDeleted).OrderBy(p => p.CapacityName).ToListAsync();

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
        [PermissionRequirement(only: "canReadVehicleCapacity")]
        public async Task<DepoApiResponse> Find([FromHeader] QueryParam<FilterQuery> queryParam)
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            int pageSize = queryParam.PageSize;
            int pageNumber = queryParam.PageNumber;
            var filter = queryParam.FilterData;

            try
            {
                var query = from capacity in _context.VehicleCapacity.Where(p => !p.IsDeleted)
                            join type in _context.VehicleType.Where(p => !p.IsDeleted) on capacity.VehicleTypeId equals type.Id
                            select new VehicleCapacity()
                            {
                                Id = capacity.Id,
                                CapacityName = capacity.CapacityName,
                                Description = capacity.Description,
                                ModifiedDate = capacity.ModifiedDate,
                                VehicleTypeId = capacity.VehicleTypeId,
                                VehicleTypeName = type.TypeName,
                            };

                if (filter != null)
                {
                    if (filter.Status.HasValue)
                    {
                        query = query.Where(a => a.IsActive == filter.Status);
                    }

                    if (!string.IsNullOrEmpty(filter.SearchText))
                    {
                        query = query.Where(u => u.CapacityName.Contains(filter.SearchText)
                        || u.Description.Contains(filter.SearchText)
                        || u.VehicleTypeName.Contains(filter.SearchText)
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
        [PermissionRequirement(only: "canCreateVehicleCapacity")]
        public async Task<DepoApiResponse> Create(VehicleCapacity model)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (string.IsNullOrEmpty(model.CapacityName))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    model.CapacityName = model.CapacityName.Trim();
                }

                var existsName = await _context.VehicleCapacity.AnyAsync(x => !x.IsDeleted && x.CapacityName == model.CapacityName);
                if (existsName)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }

                model.IsActive = true;
                model.CreateDate = DateTime.UtcNow;
                model.CreatorUserId = Utility.GetCurrentUser(User).Id;
                model.ModifiedDate = DateTime.UtcNow;
             
                await _context.VehicleCapacity.AddAsync(model);

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
        [PermissionRequirement(only: "canUpdateVehicleCapacity")]
        public async Task<DepoApiResponse> Update(long id, VehicleCapacity model)
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

                var updatedModel = await _context.VehicleCapacity.Where(x => x.Id == id).FirstOrDefaultAsync();

                if (updatedModel == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (string.IsNullOrEmpty(model.CapacityName))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    model.CapacityName = model.CapacityName.Trim();
                }

                var existsName = _context.VehicleCapacity.Any(x => !x.IsDeleted && x.CapacityName == model.CapacityName && x.Id != id);
                if (existsName)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }

                updatedModel.CapacityName = model.CapacityName;
                updatedModel.VehicleTypeId = model.VehicleTypeId;
                updatedModel.ModifiedDate = DateTime.UtcNow;
                updatedModel.ModifierUserId = Utility.GetCurrentUser(User).Id;
                updatedModel.Description = model.Description;

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
        [PermissionRequirement(only: "canDeleteVehicleCapacity")]
        public async Task<DepoApiResponse> Delete(long id)
        {
            var res = new DepoApiResponse(false);

            try
            {

                var deletedModel = await _context.VehicleCapacity.FindAsync(id);
                if (deletedModel == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                deletedModel.ModifiedDate = DateTime.UtcNow;
                deletedModel.ModifierUserId = Utility.GetCurrentUser(User).Id;
                deletedModel.IsDeleted = true;
                _context.VehicleCapacity.Update(deletedModel);

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
