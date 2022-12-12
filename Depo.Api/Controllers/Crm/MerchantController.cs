using Depo.Api.Model.Common;
using Depo.Data.Models;
using Depo.Data.Models.Attributes;
using Depo.Data.Models.Common;
using Depo.Data.Models.Crm;
using Depo.Data.Models.Definitions;
using Depo.Data.Models.Extension;
using Depo.Data.Models.Minio;
using Depo.Data.Models.Security;
using Depo.Data.Models.Utility;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Depo.Api.Controllers.Crm
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MerchantController : ControllerBase
    {
        private readonly DepoDbContext _context;
        private readonly MinioSettings _minioSettings;

        public MerchantController(DepoDbContext context, MinioSettings minioSettings)
        {
            _context = context;
            _minioSettings = minioSettings;
        }


        [HttpGet("find")]
        [PermissionRequirement(only: "canReadMerchant")]
        public async Task<DepoApiResponse> Find([FromHeader] QueryParam<FilterQuery> queryParam)
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            int pageSize = queryParam.PageSize;
            int pageNumber = queryParam.PageNumber;
            var filter = queryParam.FilterData;

            try
            {
                var query = from r in _context.Merchant.Where(p => !p.IsDeleted)   
                            select new MerchantView()
                            {
                                Id = r.Id,
                                Description = r.Description,
                                MerchantName = r.MerchantName,
                                AliasName = r.AliasName,
                                Address = r.Address,
                                RegionId = r.RegionId, 
                                CompanyId = r.CompanyId, 
                                Latitude = r.Latitude,
                                Longitude = r.Longitude,
                                WebSiteUrl = r.WebSiteUrl, 
                                Email = r.Email,
                                Phone = r.Phone,
                                City = r.City,
                                LogoCode=r.LogoCode,
                                Representive = r.Representive,
                                CreateDate=r.CreateDate.ToString("yyyy-MM-dd"),
                                Depo1Id=r.Depo1Id,
                                Depo2Id=r.Depo2Id,
                                Depo1Name= _context.Warehouse.Where(p => !p.IsDeleted &&p.Id==r.Depo1Id).FirstOrDefault().WarehouseName,
                                Depo2Name = _context.Warehouse.Where(p => !p.IsDeleted && p.Id == r.Depo2Id).FirstOrDefault().WarehouseName,
                            };

                if (filter != null)
                {
                    if (!string.IsNullOrEmpty(filter.SearchText))
                    {
                        query = query.Where(u => u.MerchantName.Contains(filter.SearchText) 
                        || u.AliasName.Contains(filter.SearchText)
                        || u.City.Contains(filter.SearchText)
                        );
                    }
                }

                query = query.OrderBy(o => o.MerchantName);

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
        [PermissionRequirement(only: "canCreateMerchant")]
        public async Task<DepoApiResponse> Create(Merchant merchant)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (string.IsNullOrEmpty(merchant.MerchantName))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    merchant.MerchantName = merchant.MerchantName.Trim();
                }

                if (string.IsNullOrEmpty(merchant.AliasName))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_ALIAS_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    merchant.AliasName = merchant.AliasName.Trim();
                }

                //if (merchant.CompanyId <= 0)
                //{
                //    res.Type = DepoApiMessageType.Form;
                //    res.Message = "CHOOSE_A_COMPANY";
                //    Console.WriteLine(res.Message);
                //    return res;
                //}

                //if (merchant.RegionId <= 0)
                //{
                //    res.Type = DepoApiMessageType.Form;
                //    res.Message = "CHOOSE_A_REGION";
                //    Console.WriteLine(res.Message);
                //    return res;
                //}


                var existsName = await _context.Merchant.AnyAsync(x => !x.IsDeleted && x.MerchantName == merchant.MerchantName);
                if (existsName)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }

                merchant.IsActive = true;
                merchant.CreateDate = DateTime.UtcNow;
                merchant.CreatorUserId = Utility.GetCurrentUser(User).Id;

                await _context.Merchant.AddAsync(merchant);

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
        [PermissionRequirement(only: "canUpdateMerchant")]
        public async Task<DepoApiResponse> Update(long id, Merchant merchant)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (id != merchant.Id)
                {
                    res.Message = "BAD_REQUEST";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var updatedModel = await _context.Merchant.Where(x => x.Id == id).FirstOrDefaultAsync();

                if (updatedModel == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (string.IsNullOrEmpty(merchant.MerchantName))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    merchant.MerchantName = merchant.MerchantName.Trim();
                }

                if (string.IsNullOrEmpty(merchant.AliasName))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_ALIAS_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    merchant.AliasName = merchant.AliasName.Trim();
                }

                //if (merchant.CompanyId <= 0)
                //{
                //    res.Type = DepoApiMessageType.Form;
                //    res.Message = "CHOOSE_A_COMPANY";
                //    Console.WriteLine(res.Message);
                //    return res;
                //}

                //if (merchant.RegionId <= 0)
                //{
                //    res.Type = DepoApiMessageType.Form;
                //    res.Message = "CHOOSE_A_CITY";
                //    Console.WriteLine(res.Message);
                //    return res;
                //}

                //if (!string.IsNullOrEmpty(merchant.Email) && !Utility.EmailRegexValidator(merchant.Email))
                //{
                //    res.Type = DepoApiMessageType.Form;
                //    res.Message = "MAIL_WRONG_TYPE";
                //    Console.WriteLine(res.Message);
                //    return res;
                //}

                //if (!string.IsNullOrEmpty(merchant.Phone) && !Utility.PhoneRegexValidator(merchant.Phone))
                //{
                //    res.Type = DepoApiMessageType.Form;
                //    res.Message = "PHONE_WRONG_TYPE";
                //    Console.WriteLine(res.Message);
                //    return res;
                //}

                var existsMerchantName = _context.Merchant.Any(x => !x.IsDeleted && x.MerchantName == merchant.MerchantName && x.Id != id);
                if (existsMerchantName)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_MERCHANTNAME";
                    Console.WriteLine(res.Message);
                    return res;
                }

                updatedModel.MerchantName = merchant.MerchantName;   
                updatedModel.AliasName = merchant.AliasName;
                updatedModel.LogoCode = merchant.LogoCode;
                updatedModel.Phone = merchant.Phone;
                updatedModel.Representive = merchant.Representive;
                updatedModel.City = merchant.City;
				updatedModel.Depo1Id = merchant.Depo1Id;
				updatedModel.Depo2Id = merchant.Depo2Id;


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
        [PermissionRequirement(only: "canDeleteMerchant")]
        public async Task<DepoApiResponse> Delete(long id)
        {
            var res = new DepoApiResponse(false);

            try
            {

                var merchant = await _context.Merchant.FindAsync(id);
                if (merchant == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                merchant.ModifiedDate = DateTime.UtcNow;
                merchant.ModifierUserId = Utility.GetCurrentUser(User).Id;
                merchant.IsDeleted = true;
                _context.Merchant.Update(merchant);

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

        [HttpGet("interviewtypes")]
        [PermissionRequirement(only: "canReadMerchant")]
        public async Task<DepoApiResponse> GetInterviewTypes()
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            try
            {
                var result = await _context.MerchantInterviewType.Where(p => !p.IsDeleted && p.IsActive).ToArrayAsync();

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

        [HttpGet("detail/{id}")]
        [PermissionRequirement(only: "canReadMerchant")]
        public async Task<DepoApiResponse> GetDetailById(long id)
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            try
            {
                var result = await (from m in _context.Merchant.Where(p => !p.IsDeleted && p.IsActive && p.Id == id)
                                    select new Merchant()
                                    {
                                        Id = id,
                                        TenderDate = m.TenderDate,
                                        VehicleCount = m.VehicleCount,
                                        ShiftCount = m.ShiftCount,
                                        CustomerRepresentativeId = m.CustomerRepresentativeId,
                                        ContractEndDate = m.ContractEndDate,
                                        ContractPeriod = m.ContractPeriod,
                                        HasService = m.HasService,
                                        IsSpecialTransfer = m.IsSpecialTransfer,
                                        CompetitorsId = m.CompetitorsId,
                                        PersonalCount = m.PersonalCount,
                                        VehicleDetail = m.VehicleDetail,
                                        MerchantName = m.MerchantName,
                                    }
                                    ).FirstOrDefaultAsync();

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

        [HttpPut("detail/{id}")]
        [PermissionRequirement(only: "canUpdateMerchant")]
        public async Task<DepoApiResponse> SetDetailById(long id, Merchant merchant)
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            try
            {
                if (id != merchant.Id)
                {
                    res.Message = "BAD_REQUEST";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var updatedModel = await _context.Merchant.Where(x => x.Id == id).FirstOrDefaultAsync();

                if (updatedModel == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (merchant.HasService && merchant.CompetitorsId <= 0)
                {
                    res.Message = "CHOOSE_A_COMPETITOR";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (merchant.VehicleDetail != null && merchant.VehicleDetail.Count > 0 && merchant.VehicleDetail.Any(p => p.VehicleCapacityId <= 0))
                {
                    res.Message = "CHOOSE_VEHICLE_DETAIL(S)";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (!merchant.HasService && merchant.CompetitorsId > 0)
                    merchant.CompetitorsId = 0;

                updatedModel.VehicleDetailJson = JsonConvert.SerializeObject(merchant.VehicleDetail);
                updatedModel.VehicleCount = merchant.VehicleCount;
                updatedModel.ShiftCount = merchant.ShiftCount;
                updatedModel.CompetitorsId = merchant.CompetitorsId;
                updatedModel.ContractEndDate = merchant.ContractEndDate;
                updatedModel.CustomerRepresentativeId = merchant.CustomerRepresentativeId;
                updatedModel.TenderDate = merchant.TenderDate;
                updatedModel.ContractPeriod = merchant.ContractPeriod;
                updatedModel.HasService = merchant.HasService;
                updatedModel.PersonalCount = merchant.PersonalCount;
                updatedModel.IsSpecialTransfer = merchant.IsSpecialTransfer;

                updatedModel.ModifiedDate = DateTime.UtcNow;
                updatedModel.ModifierUserId = Utility.GetCurrentUser(User).Id;

                _context.Entry(updatedModel).State = EntityState.Modified;

                var result = await _context.SaveChangesAsync();
                if (result > 0)
                    res = new DepoApiResponse(true, "RECORD_SUCCESSFULLY_UPDATED");

                return res;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return res;
            }
        }

        [HttpPost("interview/{id}")]
        [PermissionRequirement(only: "canUpdateMerchant")]
        public async Task<DepoApiResponse> CreateInterview(long id, MerchantInterview merchantInterview)
        {
            var res = new DepoApiResponse(false);
            try
            {
                if (id <= 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_MERCHANT";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (merchantInterview == null)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_INTERVIEW";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (merchantInterview.MerchantContactId < 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_CONTACT_PERSON";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (merchantInterview.InterviewTypeId < 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_INTERVIEW_TYPE";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (merchantInterview.InterviewDate == DateTime.MinValue)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_INTERVIEW_DATE";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (string.IsNullOrEmpty(merchantInterview.Title))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_INTERVIEW_TITLE";
                    Console.WriteLine(res.Message);
                    return res;
                }

                _context.Add(merchantInterview);

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

        [HttpPut("interview/{id}")]
        [PermissionRequirement(only: "canUpdateMerchant")]
        public async Task<DepoApiResponse> UpdateInterview(long id, MerchantInterview merchantInterview)
        {
            var res = new DepoApiResponse(false);
            try
            {
                if (id <= 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_MERCHANT";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (merchantInterview == null)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_INTERVIEW";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (merchantInterview.MerchantContactId < 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_CONTACT_PERSON";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (merchantInterview.InterviewTypeId < 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_INTERVIEW_TYPE";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (merchantInterview.InterviewDate == DateTime.MinValue)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_INTERVIEW_DATE";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (string.IsNullOrEmpty(merchantInterview.Title))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_INTERVIEW_TITLE";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var interview = await _context.MerchantInterview.FindAsync(id);
                if (interview == null)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "INTERVIEW_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                interview.ModifiedDate = DateTime.UtcNow;
                interview.ModifierUserId = Utility.GetCurrentUser(User).Id;
                interview.Title = merchantInterview.Title;
                interview.InterviewDate = merchantInterview.InterviewDate;
                interview.InterviewTypeId = merchantInterview.InterviewTypeId;
                interview.MerchantContactId = merchantInterview.MerchantContactId;
                interview.Description = merchantInterview.Description;

                _context.Update(interview);

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

        [HttpDelete("interview/{id}")]
        [PermissionRequirement(only: "canDeleteMerchant")]
        public async Task<DepoApiResponse> DeleteInterview(long id)
        {
            var res = new DepoApiResponse(false);
            try
            {
                if (id <= 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_MERCHANT";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var interview = await _context.MerchantInterview.FindAsync(id);
                if (interview == null)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "INTERVIEW_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                interview.ModifiedDate = DateTime.UtcNow;
                interview.ModifierUserId = Utility.GetCurrentUser(User).Id;
                interview.IsDeleted = true;

                _context.Update(interview);

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

        [HttpGet("find-interview")]
        [PermissionRequirement(only: "canReadMerchant")]
        public async Task<DepoApiResponse> GetMerchantInterview([FromHeader] QueryParam<FilterWithMerchantQuery> queryParam)
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            int pageSize = queryParam.PageSize;
            int pageNumber = queryParam.PageNumber;
            var filter = queryParam.FilterData;

            try
            {
                var query = from mi in _context.MerchantInterview.Where(p => !p.IsDeleted && p.MerchantId == filter.MerchantId)
                            join mc in _context.MerchantContact on mi.MerchantContactId equals mc.Id
                            join mit in _context.MerchantInterviewType on mi.InterviewTypeId equals mit.Id
                            where !mc.IsDeleted
                            select new MerchantInterviewModel()
                            {
                                Id = mi.Id,
                                Title = mi.Title,
                                Name = mc.ContactPerson,
                                InterviewType = mit.InterviewType,
                                InterviewDate = mi.InterviewDate,
                                MerchantId = mi.MerchantId,
                                MerchantContactId = mc.Id,
                                Description = mi.Description,
                                InterviewTypeId = mi.InterviewTypeId,
                            };

                if (filter != null)
                {
                    if (!string.IsNullOrEmpty(filter.SearchText))
                    {
                        query = query.Where(u => u.InterviewType.Contains(filter.SearchText)
                        || u.Title.Contains(filter.SearchText)
                        || u.Name.Contains(filter.SearchText)
                        || u.Description.Contains(filter.SearchText)
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

        //Concact
        [HttpGet("find/{id}")]
        [PermissionRequirement(only: "canReadMerchant")]
        public async Task<DepoApiResponse> GetMerchantContacts(long id, [FromHeader] QueryParam<FilterQuery> queryParam)
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            int pageSize = queryParam.PageSize;
            int pageNumber = queryParam.PageNumber;
            var filter = queryParam.FilterData;

            try
            {
                var query = from mc in _context.MerchantContact.Where(p => !p.IsDeleted)
                            where !mc.IsDeleted && mc.MerchantId == id
                            select mc;/*new ContactUser()*/
                            //{
                            //    Id = mc.Id,
                            //    Title = mc.ContactTitle,
                            //    Email = mc.ContactEmail,
                            //    Name = mc.ContactPerson,
                            //    PhoneNumber = mc.ContactPhone,
                            //};

                if (filter != null)
                {
                    if (!string.IsNullOrEmpty(filter.SearchText))
                    {
                        query = query.Where(u =>
                           (!string.IsNullOrEmpty(u.ContactEmail) && u.ContactEmail.Contains(filter.SearchText))
                            || (!string.IsNullOrEmpty(u.ContactTitle) && u.ContactTitle.Contains(filter.SearchText))
                            || (!string.IsNullOrEmpty(u.ContactPerson) && u.ContactPerson.Contains(filter.SearchText))
                            || (!string.IsNullOrEmpty(u.ContactPhone) && u.ContactPhone.Contains(filter.SearchText))
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

        [HttpGet("contact/{id}")]
        [PermissionRequirement(only: "canReadMerchant")]
        public async Task<DepoApiResponse> GetMerchantContactPerson(long id)
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            try
            {
                var result = await (from mc in _context.MerchantContact
                                    where !mc.IsDeleted && mc.MerchantId == id
                                    select new ContactUser()
                                    {
                                        Id = mc.Id,
                                        Name = mc.ContactPerson
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

        [HttpPost("contact/{id}")]
        [PermissionRequirement(only: "canUpdateMerchant")]
        public async Task<DepoApiResponse> CreateContactPerson(long id, MerchantContact users)
        {
            var res = new DepoApiResponse(false);
            try
            {
                if (id <= 0 || id != users.MerchantId)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_MERCHANT";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (users == null || !users.UserId.Any())
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_USER";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                    users.UserIdJson = JsonConvert.SerializeObject(users.UserId);

                if (!string.IsNullOrEmpty(users.ContactEmail) && !Utility.EmailRegexValidator(users.ContactEmail))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "EMAIL_IS_NOT_CORRECT_FORMAT";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (!string.IsNullOrEmpty(users.ContactPhone) && !Utility.PhoneRegexValidator(users.ContactPhone))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "PHONE_IS_NOT_CORRECT_FORMAT";
                    Console.WriteLine(res.Message);
                    return res;
                }


                await _context.MerchantContact.AddAsync(users);

                var result = await _context.SaveChangesAsync();
                if (result > 0)
                    res = new DepoApiResponse(true, "RECORD_SUCCESSFULLY_CREATED");

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
                return res;
            }

            res = new DepoApiResponse(true, "");
            return res;
        }

        [HttpPut("contact/{id}")]
        [PermissionRequirement(only: "canUpdateMerchant")]
        public async Task<DepoApiResponse> UpdateContactPerson(long id, MerchantContact users)
        {
            var res = new DepoApiResponse(false);
            try
            {
                if (id <= 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_MERCHANT";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (users == null || !users.UserId.Any())
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_USER";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                    users.UserIdJson = JsonConvert.SerializeObject(users.UserId);

                if (!string.IsNullOrEmpty(users.ContactEmail) && !Utility.EmailRegexValidator(users.ContactEmail))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "EMAIL_IS_NOT_CORRECT_FORMAT";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (!string.IsNullOrEmpty(users.ContactPhone) && !Utility.PhoneRegexValidator(users.ContactPhone))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "PHONE_IS_NOT_CORRECT_FORMAT";
                    Console.WriteLine(res.Message);
                    return res;
                }


                var contactOfMerchant = await _context.MerchantContact.Where(p => !p.IsDeleted && p.MerchantId == users.MerchantId && p.Id == id).FirstOrDefaultAsync();
                if (contactOfMerchant == null)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                contactOfMerchant.UserIdJson = users.UserIdJson;
                contactOfMerchant.ContactPerson = users.ContactPerson;
                contactOfMerchant.ContactEmail = users.ContactEmail;
                contactOfMerchant.ContactPhone = users.ContactPhone;
                contactOfMerchant.ContactTitle = users.ContactTitle;
                contactOfMerchant.ModifiedDate = DateTime.UtcNow;
                contactOfMerchant.ModifierUserId = Utility.GetCurrentUser(User).Id;

                _context.MerchantContact.Update(contactOfMerchant);

                var result = await _context.SaveChangesAsync();
                if (result > 0)
                    res = new DepoApiResponse(true, "RECORD_SUCCESSFULLY_UPDATED");

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
                return res;
            }

            res = new DepoApiResponse(true, "");
            return res;
        }

        [HttpDelete("contact/{id}")]
        [PermissionRequirement(only: "canUpdateMerchant")]
        public async Task<DepoApiResponse> DeleteContactPerson(long id)
        {
            var res = new DepoApiResponse(false);
            try
            {
                if (id <= 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_CONTACT_PERSON";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var contactOfMerchant = await _context.MerchantContact.Where(p => !p.IsDeleted &&  p.Id == id).FirstOrDefaultAsync();
                if (contactOfMerchant == null)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                contactOfMerchant.IsDeleted = true;
                contactOfMerchant.ModifiedDate = DateTime.UtcNow;
                contactOfMerchant.ModifierUserId = Utility.GetCurrentUser(User).Id;

                _context.MerchantContact.Update(contactOfMerchant);

                var result = await _context.SaveChangesAsync();
                if (result > 0)
                    res = new DepoApiResponse(true, "RECORD_SUCCESSFULLY_DELETED");

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
                return res;
            }

            res = new DepoApiResponse(true, "");
            return res;
        }

        //Contract
        [HttpGet("find-contract")]
        [PermissionRequirement(only: "canReadMerchant")]
        public async Task<DepoApiResponse> GetMerchantContract([FromHeader] QueryParam<FilterWithMerchantQuery> queryParam)
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            int pageSize = queryParam.PageSize;
            int pageNumber = queryParam.PageNumber;
            var filter = queryParam.FilterData;

            try
            {
                var query = from mi in _context.MerchantContract.Where(p => !p.IsDeleted && p.MerchantId == filter.MerchantId)
                            where !mi.IsDeleted
                            select mi;


                if (filter != null)
                {
                    if (!string.IsNullOrEmpty(filter.SearchText))
                    {
                        query = query.Where(u => u.Description.Contains(filter.SearchText));
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

        [HttpPost("contract/{id}")]
        [PermissionRequirement(only: "canUpdateMerchant")]
        public async Task<DepoApiResponse> CreateMerchantContract(long id, MerchantContract merchantContract)
        {
            var res = new DepoApiResponse(false);
            try
            {
                if (id <= 0 || id != merchantContract.MerchantId)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_MERCHANT";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (merchantContract.ContractDate == DateTime.MinValue)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_DATE";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var allContractOfMerchant = await _context.MerchantContract.Where(p => !p.IsDeleted && p.MerchantId == id).ToListAsync();

                #region SameDateControl
                if (allContractOfMerchant != null && allContractOfMerchant.Any())
                {
                    if (allContractOfMerchant.Any(p => p.ContractDate.Date == merchantContract.ContractDate.Date))
                    {
                        res.Type = DepoApiMessageType.Form;
                        res.Message = "YOU_HAVE_A_CONTRACT_ON_THIS_DAY";
                        Console.WriteLine(res.Message);
                        return res;
                    }
                }
                #endregion

                merchantContract.CreateDate = DateTime.UtcNow;
                merchantContract.CreatorUserId = Utility.GetCurrentUser(User).Id;

                _context.Add(merchantContract);

                var result = await _context.SaveChangesAsync();
                if (result > 0)
                    res = new DepoApiResponse(true, "RECORD_SUCCESSFULLY_CREATED");

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
                return res;
            }

            res = new DepoApiResponse(true, "");
            return res;
        }

        [HttpPut("contract/{id}")]
        [PermissionRequirement(only: "canUpdateMerchant")]
        public async Task<DepoApiResponse> UpdateMerchantContract(long id, MerchantContract merchantContract)
        {
            var res = new DepoApiResponse(false);
            try
            {
                if (id <= 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_MERCHANT";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var contractOfMerchant = await _context.MerchantContract.Where(p => !p.IsDeleted && p.MerchantId == merchantContract.MerchantId && p.Id == id).FirstOrDefaultAsync();

                if (contractOfMerchant == null)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                #region UpdateModel

                contractOfMerchant.InflationProcessingPercentage = merchantContract.InflationProcessingPercentage;
                contractOfMerchant.InflationCheckPeriod = merchantContract.InflationCheckPeriod;
                contractOfMerchant.Description = merchantContract.Description;
                contractOfMerchant.FuelCheckPeriod = merchantContract.FuelCheckPeriod;
                contractOfMerchant.FuelProcessingPercentage = merchantContract.FuelProcessingPercentage;
                contractOfMerchant.PercentageOfFuelPriceWillBeProcessed = merchantContract.PercentageOfFuelPriceWillBeProcessed;
                contractOfMerchant.PercentageOfInflationPriceWillBeProcessed = merchantContract.PercentageOfInflationPriceWillBeProcessed;
                contractOfMerchant.ModifiedDate = DateTime.UtcNow;
                contractOfMerchant.ModifierUserId = Utility.GetCurrentUser(User).Id;

                #endregion

                _context.Update(contractOfMerchant);

                var result = await _context.SaveChangesAsync();
                if (result > 0)
                    res = new DepoApiResponse(true, "RECORD_SUCCESSFULLY_UPDATED");

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
                return res;
            }

            res = new DepoApiResponse(true, "");
            return res;
        }

        [HttpDelete("contract/{id}")]
        [PermissionRequirement(only: "canUpdateMerchant")]
        public async Task<DepoApiResponse> DeleteMerchantContract(long id)
        {
            var res = new DepoApiResponse(false);
            try
            {
                if (id <= 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_MERCHANT";
                    Console.WriteLine(res.Message);
                    return res;
                }


                var contractOfMerchant = await _context.MerchantContract.FindAsync(id);

                if (contractOfMerchant == null)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                contractOfMerchant.ModifiedDate = DateTime.UtcNow;
                contractOfMerchant.ModifierUserId = Utility.GetCurrentUser(User).Id;
                contractOfMerchant.IsDeleted = true;
                _context.Update(contractOfMerchant);

                var result = await _context.SaveChangesAsync();
                if (result > 0)
                    res = new DepoApiResponse(true, "RECORD_SUCCESSFULLY_DELETED");

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
                return res;
            }

            res = new DepoApiResponse(true, "");
            return res;
        }

        //Offer
        [HttpGet("find-offer")]
        [PermissionRequirement(only: "canReadMerchant")]
        public async Task<DepoApiResponse> GetMerchantOffer([FromHeader] QueryParam<FilterWithMerchantQuery> queryParam)
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            int pageSize = queryParam.PageSize;
            int pageNumber = queryParam.PageNumber;
            var filter = queryParam.FilterData;

            try
            {
                var query = from mo in _context.MerchantOffer.Where(p => !p.IsDeleted && p.MerchantId == filter.MerchantId)
                            join u in _context.Users on mo.CreatorUserId equals u.Id
                            where !mo.IsDeleted
                            select new MerchantOffer()
                            {
                                Id = mo.Id,
                                DriverCost = mo.DriverCost,
                                CustomerMaturity = mo.CustomerMaturity,
                                Description = mo.Description,
                                AnnualFinancingFee = mo.AnnualFinancingFee,
                                BusRentalFee = mo.BusRentalFee,
                                CarRentalFee = mo.CarRentalFee,
                                ControlToolCost = mo.ControlToolCost,
                                ControlToolCount = mo.ControlToolCount,
                                FuelCommissionRate = mo.FuelCommissionRate,
                                FuelLiterFee = mo.FuelLiterFee,
                                FuelMaturity = mo.FuelMaturity,
                                LetterOfGuaranteeFee = mo.LetterOfGuaranteeFee,
                                MerchantId = mo.MerchantId,
                                MidiRentalFee = mo.MidiRentalFee,
                                MiniRentalFee = mo.MiniRentalFee,
                                ProfitMultiplier = mo.ProfitMultiplier,
                                ProjectManagerCost = mo.ProjectManagerCost,
                                SubcontractorMaturity = mo.SubcontractorMaturity,
                                Status = mo.Status,
                                UserName = u.Name + " " + u.Surname,
                                ModifiedDate = mo.ModifiedDate,
                                CreatorUserId = mo.CreatorUserId,
                                MerchantOfferFile = _context.MerchantOfferFile.Where(p => !p.IsDeleted && p.MerchantId == mo.MerchantId && p.MerchantOfferId == mo.Id).ToList()
                            };


                if (filter != null)
                {
                    if (!string.IsNullOrEmpty(filter.SearchText))
                    {
                        query = query.Where(u => u.Description.Contains(filter.SearchText)
                        || u.UserName.Contains(filter.SearchText)
                        || u.Status.Contains(filter.SearchText));
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

        [HttpPost("offer/{id}")]
        public async Task<DepoApiResponse> CreateMerchantOffer(long id, MerchantOffer merchantOffer)
        {
            var res = new DepoApiResponse(false);
            try
            {
                if (id <= 0 || id != merchantOffer.MerchantId)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_MERCHANT";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else if (merchantOffer.FileSize > 0 && string.IsNullOrEmpty(merchantOffer.FileType))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_FILETYPE";
                    Console.WriteLine(res.Message);
                    return res;
                }

                merchantOffer.CreateDate = DateTime.UtcNow;
                merchantOffer.CreatorUserId = Utility.GetCurrentUser(User).Id;

                await _context.AddAsync(merchantOffer);

                int result = await _context.SaveChangesAsync();
                if (result > 0)
                {
                    if (merchantOffer.FileSize > 0)
                    {
                        #region File Upload

                        var merchantOfferFile = new MerchantOfferFile();
                        merchantOfferFile.MerchantId = merchantOffer.MerchantId;
                        merchantOfferFile.FilePath = merchantOffer.FilePath;
                        merchantOfferFile.FileName = merchantOffer.FileName;
                        merchantOfferFile.FileSize = merchantOffer.FileSize;
                        merchantOfferFile.ModifiedDate = DateTime.UtcNow;
                        merchantOfferFile.ModifierUserId = Utility.GetCurrentUser(User).Id;
                        merchantOfferFile.MerchantOfferId = merchantOffer.Id;
                        merchantOfferFile.CreatorUserId = Utility.GetCurrentUser(User).Id;
                        merchantOfferFile.CreateDate = DateTime.UtcNow;
                        merchantOfferFile.FileType = merchantOffer.FileType;

                        await _context.AddAsync(merchantOfferFile);

                        await _context.SaveChangesAsync();

                        #endregion
                    }

                    res = new DepoApiResponse(true, "RECORD_SUCCESSFULLY_CREATED");
                }

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
                return res;
            }

            res = new DepoApiResponse(true, "");
            return res;
        }

        [HttpPut("offer/{id}")]
        [PermissionRequirement(only: "canUpdateMerchant")]
        public async Task<DepoApiResponse> UpdateMerchantOffer(long id, MerchantOffer merchantOffer)
        {
            var res = new DepoApiResponse(false);
            try
            {
                if (id <= 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_MERCHANT";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else if (merchantOffer.FileSize > 0 && string.IsNullOrEmpty(merchantOffer.FileType))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_FILETYPE";
                    Console.WriteLine(res.Message);
                    return res;
                }

                var offerOfMerchant = await _context.MerchantOffer.Where(p => !p.IsDeleted && p.MerchantId == merchantOffer.MerchantId && p.Id == id).FirstOrDefaultAsync();

                if (offerOfMerchant == null)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                #region UpdateModel

                offerOfMerchant.ProjectManagerCost = merchantOffer.ProjectManagerCost;
                offerOfMerchant.DriverCost = merchantOffer.DriverCost;
                offerOfMerchant.Status = merchantOffer.Status;
                offerOfMerchant.AnnualFinancingFee = merchantOffer.AnnualFinancingFee;
                offerOfMerchant.BusRentalFee = merchantOffer.BusRentalFee;
                offerOfMerchant.CarRentalFee = merchantOffer.CarRentalFee;
                offerOfMerchant.ControlToolCost = merchantOffer.ControlToolCost;
                offerOfMerchant.ControlToolCount = merchantOffer.ControlToolCount;
                offerOfMerchant.FuelLiterFee = merchantOffer.FuelLiterFee;
                offerOfMerchant.ProfitMultiplier = merchantOffer.ProfitMultiplier;
                offerOfMerchant.LetterOfGuaranteeFee = merchantOffer.LetterOfGuaranteeFee;
                offerOfMerchant.MidiRentalFee = merchantOffer.MidiRentalFee;
                offerOfMerchant.MiniRentalFee = merchantOffer.MiniRentalFee;
                offerOfMerchant.SubcontractorMaturity = merchantOffer.SubcontractorMaturity;
                offerOfMerchant.Description = merchantOffer.Description;
                offerOfMerchant.CustomerMaturity = merchantOffer.CustomerMaturity;
                offerOfMerchant.FuelCommissionRate = merchantOffer.FuelCommissionRate;
                offerOfMerchant.FuelMaturity = merchantOffer.FuelMaturity;


                offerOfMerchant.ModifiedDate = DateTime.UtcNow;
                offerOfMerchant.ModifierUserId = Utility.GetCurrentUser(User).Id;

                #endregion

                _context.Update(offerOfMerchant);

                if (merchantOffer.FileSize > 0)
                {
                    var merchantOfferFile = await _context.MerchantOfferFile.Where(p => !p.IsDeleted && p.MerchantId == merchantOffer.MerchantId && p.MerchantOfferId == merchantOffer.Id && p.FileType == merchantOffer.FileType).FirstOrDefaultAsync();

                    #region File Upload

                    if (merchantOfferFile == null)
                    {
                        merchantOfferFile = new MerchantOfferFile();
                        merchantOfferFile.MerchantId = merchantOffer.MerchantId;
                        merchantOfferFile.FilePath = merchantOffer.FilePath;
                        merchantOfferFile.FileName = merchantOffer.FileName;
                        merchantOfferFile.FileSize = merchantOffer.FileSize;
                        merchantOfferFile.ModifiedDate = DateTime.UtcNow;
                        merchantOfferFile.ModifierUserId = Utility.GetCurrentUser(User).Id;
                        merchantOfferFile.MerchantOfferId = merchantOffer.Id;
                        merchantOfferFile.CreatorUserId = Utility.GetCurrentUser(User).Id;
                        merchantOfferFile.CreateDate = DateTime.UtcNow;
                        merchantOfferFile.FileType = merchantOffer.FileType;
                        await _context.AddAsync(merchantOfferFile);
                    }
                    else
                    {
                        merchantOfferFile = new MerchantOfferFile();
                        merchantOfferFile.FilePath = merchantOffer.FilePath;
                        merchantOfferFile.FileName = merchantOffer.FileName;
                        merchantOfferFile.FileSize = merchantOffer.FileSize;
                        merchantOfferFile.FileType = merchantOffer.FileType;
                        merchantOfferFile.ModifiedDate = DateTime.UtcNow;
                        merchantOfferFile.ModifierUserId = Utility.GetCurrentUser(User).Id;
                        _context.Update(merchantOfferFile);
                    }

                    #endregion
                }

                var result = await _context.SaveChangesAsync();
                if (result > 0)
                    res = new DepoApiResponse(true, "RECORD_SUCCESSFULLY_UPDATED");

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
                return res;
            }

            res = new DepoApiResponse(true, "");
            return res;
        }

        [HttpDelete("offer/{id}")]
        [PermissionRequirement(only: "canUpdateMerchant")]
        public async Task<DepoApiResponse> DeleteMerchantOffer(long id)
        {
            var res = new DepoApiResponse(false);
            try
            {
                if (id <= 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_MERCHANT";
                    Console.WriteLine(res.Message);
                    return res;
                }


                var offerOfMerchant = await _context.MerchantOffer.FindAsync(id);

                if (offerOfMerchant == null)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                offerOfMerchant.ModifiedDate = DateTime.UtcNow;
                offerOfMerchant.ModifierUserId = Utility.GetCurrentUser(User).Id;
                offerOfMerchant.IsDeleted = true;
                _context.Update(offerOfMerchant);

                var result = await _context.SaveChangesAsync();
                if (result > 0)
                    res = new DepoApiResponse(true, "RECORD_SUCCESSFULLY_DELETED");

            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                res.Data = "Unexpected Error";
                return res;
            }

            res = new DepoApiResponse(true, "");
            return res;
        }

        [HttpPost("offer/upload")]
        [DisableRequestSizeLimit]
        public async Task<DepoApiResponse> UploadApk(IFormFile file)
        {
            var result = new DepoApiResponse(false);

            try
            {
                if (file != null && file.Length != 0)
                {
                    bool extensionError = false;
                    switch (Path.GetExtension(file.FileName).ToLower())
                    {
                        case ".xls":
                        case ".xlsx":
                        case ".pdf":
                        case ".doc":
                        case ".docx":
                        case ".png":
                        case ".jpg":
                        case ".jpeg":
                            {
                                break;
                            }
                        default:
                            {
                                extensionError = true;
                                break;
                            }
                    }
                    if (extensionError)
                    {
                        result.Message = "Please upload the file in the specified extension..";
                        Console.WriteLine(result.Message);
                        return result;
                    }

                    string bucketName = "teklif";

                    var minioClient = new MinioConnection(_minioSettings).Open();
                    bool hasBucket = await minioClient.BucketExistsAsync(bucketName);
                    if (!hasBucket)
                    {
                        await minioClient.MakeBucketAsync(bucketName, "us-east-1");
                    }

                    var fileExt = Path.GetExtension(file.FileName);
                    var fileName = Guid.NewGuid();
                    var filePath = fileName + fileExt;

                    await minioClient.PutObjectAsync(bucketName, filePath, file.OpenReadStream(), file.Length, "application/octet-stream");

                    result.IsSuccess = true;
                    result.Type = DepoApiMessageType.NONE;
                    result.Data = new
                    {
                        FileName = file.FileName,
                        FileSize = file.Length,
                        FilePath = filePath
                    };
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }

            return result;
        }

        [HttpPost("getDocumentByFilepath")]
        public async Task<IActionResult> GetDocumentByFilepath(MerchantOfferFile model)
        {
            var file = new MemoryStream();

            try
            {
                string bucketName = "teklif";
                var minioClient = new MinioConnection(_minioSettings).Open();

                await minioClient.GetObjectAsync(bucketName, model.FilePath,
                   (stream) =>
                   {
                       stream.CopyTo(file);
                   });

                file.Position = 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }

            return File(file, "application/octet-stream", enableRangeProcessing: true);
        }
    }
}
