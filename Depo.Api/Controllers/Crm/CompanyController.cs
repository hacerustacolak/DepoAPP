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
    public class CompanyController : ControllerBase
    {
        private readonly DepoDbContext _context;

        public CompanyController(DepoDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        [PermissionRequirement(only: "canReadCompany")]
        public async Task<DepoApiResponse> GetAll()
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            try
            {
                var result = await (from r in _context.Company.Where(p => !p.IsDeleted)
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
        [PermissionRequirement(only: "canReadCompany")]
        public async Task<DepoApiResponse> Find([FromHeader] QueryParam<FilterQuery> queryParam)
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            int pageSize = queryParam.PageSize;
            int pageNumber = queryParam.PageNumber;
            var filter = queryParam.FilterData;

            try
            {
                var query = from r in _context.Company.Where(p => !p.IsDeleted)
                            join c in _context.Group.Where(p => !p.IsDeleted) on r.GroupId equals c.Id
                            select new CompanyView()
                            {
                                Id = r.Id,
                                Description = r.Description,
                                GroupName = c.Name,
                                GroupId = c.Id,
                                Name = r.Name,
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
                        || u.Description.Contains(filter.SearchText)
                        || u.GroupName.Contains(filter.SearchText)
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
        [PermissionRequirement(only: "canCreateCompany")]
        public async Task<DepoApiResponse> Create(Company company)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (string.IsNullOrEmpty(company.Name))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    company.Name = company.Name.Trim();
                }

                if (string.IsNullOrEmpty(company.Description))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_DESCRIPTION";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    company.Description = company.Description.Trim();
                }

                if (company.GroupId <= 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "CHOOSE A GROUP";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var existsName = await _context.Company.AnyAsync(x => !x.IsDeleted && x.Name == company.Name);
                if (existsName)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }

                company.IsActive = true;
                company.CreateDate = DateTime.UtcNow;
                company.CreatorUserId = Utility.GetCurrentUser(User).Id;

                await _context.Company.AddAsync(company);

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
        [PermissionRequirement(only: "canUpdateCompany")]
        public async Task<DepoApiResponse> Update(long id, Company company)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (id != company.Id)
                {
                    res.Message = "BAD_REQUEST";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var updatedModel = await _context.Company.Where(x => x.Id == id).FirstOrDefaultAsync();

                if (updatedModel == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (string.IsNullOrEmpty(company.Name))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    company.Name = company.Name.Trim();
                }

                if (string.IsNullOrEmpty(company.Description))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_DESCRIPTION";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    company.Description = company.Description.Trim();
                }

                var existsCompanyName = _context.Company.Any(x => !x.IsDeleted && x.Name == company.Name && x.Id != id);
                if (existsCompanyName)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_CompanyName";
                    Console.WriteLine(res.Message);
                    return res;
                }

                updatedModel.Name = company.Name;
                updatedModel.GroupId = company.GroupId;
                updatedModel.Description = company.Description;
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
        [PermissionRequirement(only: "canDeleteCompany")]
        public async Task<DepoApiResponse> Delete(long id)
        {
            var res = new DepoApiResponse(false);

            try
            {

                var company = await _context.Company.FindAsync(id);
                if (company == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                company.ModifiedDate = DateTime.UtcNow;
                company.ModifierUserId = Utility.GetCurrentUser(User).Id;
                company.IsDeleted = true;
                _context.Company.Update(company);

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
