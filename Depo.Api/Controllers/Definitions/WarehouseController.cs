using Depo.Data.Models.Minio;
using Depo.Data.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Depo.Api.Model.Common;
using Depo.Data.Models.Attributes;
using Depo.Data.Models.Common;
using Depo.Data.Models.Crm;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System.Threading.Tasks;
using System;
using Depo.Data.Models.Utility;
using Depo.Data.Models.Definitions;
using Depo.Data.Models.Extension;

namespace Depo.Api.Controllers.Definitions
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class WarehouseController : ControllerBase
    {
        private readonly DepoDbContext _context;
        public WarehouseController(DepoDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [PermissionRequirement(only: "canReadWarehouse")]
        public async Task<DepoApiResponse> GetAll()
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            try
            {
                var result = await (from r in _context.Warehouse.Where(p => !p.IsDeleted)
                                    select new Warehouse()
                                    {
                                        Id = r.Id,
                                        WarehouseName = r.WarehouseName
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
        [PermissionRequirement(only: "canReadWarehouse")]
        public async Task<DepoApiResponse> Find([FromHeader] QueryParam<FilterQuery> queryParam)
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            int pageSize = queryParam.PageSize;
            int pageNumber = queryParam.PageNumber;
            var filter = queryParam.FilterData;

            try
            {
                var query = from r in _context.Warehouse.Where(p => !p.IsDeleted)
                            select new Warehouse()
                            {
                                Id = r.Id,
                                Phone = r.Phone,
                                City = r.City,
                                LogoCode = r.LogoCode,
                                Representative = r.Representative,
                                Address = r.Address,
                                WarehouseName = r.WarehouseName
                            };

                if (filter != null)
                {
                    if (!string.IsNullOrEmpty(filter.SearchText))
                    {
                        query = query.Where(u => u.WarehouseName.Contains(filter.SearchText)
                        || u.LogoCode.Contains(filter.SearchText)
                        || u.Representative.Contains(filter.SearchText)
                        || u.City.Contains(filter.SearchText)
                        );
                    }
                }

                query = query.OrderBy(o => o.WarehouseName);

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
        [PermissionRequirement(only: "canCreateWarehouse")]
        public async Task<DepoApiResponse> Create(Warehouse warehouse)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (string.IsNullOrEmpty(warehouse.WarehouseName))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    warehouse.WarehouseName = warehouse.WarehouseName.Trim();
                }

                if (string.IsNullOrEmpty(warehouse.Representative))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_REPRESENTATIVE_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    warehouse.Representative = warehouse.Representative.Trim();
                }

                if (string.IsNullOrEmpty(warehouse.LogoCode))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_LOGOCODE";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    warehouse.LogoCode = warehouse.LogoCode.Trim();
                }


                var existsName = await _context.Warehouse.AnyAsync(x => !x.IsDeleted && x.WarehouseName == warehouse.WarehouseName);
                if (existsName)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }

                warehouse.IsActive = true;
                warehouse.CreateDate = DateTime.UtcNow;
                warehouse.CreatorUserId = Utility.GetCurrentUser(User).Id;

                await _context.Warehouse.AddAsync(warehouse);

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
        [PermissionRequirement(only: "canUpdateWarehouse")]
        public async Task<DepoApiResponse> Update(long id, Warehouse warehouse)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (id != warehouse.Id)
                {
                    res.Message = "BAD_REQUEST";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var updatedModel = await _context.Warehouse.Where(x => x.Id == id).FirstOrDefaultAsync();

                if (updatedModel == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (string.IsNullOrEmpty(warehouse.WarehouseName))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    warehouse.WarehouseName = warehouse.WarehouseName.Trim();
                }

                if (string.IsNullOrEmpty(warehouse.Representative))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_REPRESENTATIVE_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    warehouse.Representative = warehouse.Representative.Trim();
                }

                if (string.IsNullOrEmpty(warehouse.LogoCode))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_LOGOCODE";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    warehouse.LogoCode = warehouse.LogoCode.Trim();
                }


                var existsWarehouseName = _context.Warehouse.Any(x => !x.IsDeleted && x.WarehouseName == warehouse.WarehouseName && x.Id != id);
                if (existsWarehouseName)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_WAREHOUSENAME";
                    Console.WriteLine(res.Message);
                    return res;
                }

                updatedModel.WarehouseName = warehouse.WarehouseName;
                updatedModel.Representative = warehouse.Representative;
                updatedModel.LogoCode = warehouse.LogoCode;
                updatedModel.Phone = warehouse.Phone;
                updatedModel.Address = warehouse.Address;
                updatedModel.City = warehouse.City;


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
        [PermissionRequirement(only: "canDeleteWarehouse")]
        public async Task<DepoApiResponse> Delete(long id)
        {
            var res = new DepoApiResponse(false);

            try
            {

                var warehouse = await _context.Warehouse.FindAsync(id);
                if (warehouse == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                warehouse.ModifiedDate = DateTime.UtcNow;
                warehouse.ModifierUserId = Utility.GetCurrentUser(User).Id;
                warehouse.IsDeleted = true;
                _context.Warehouse.Update(warehouse);

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
