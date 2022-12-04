using Depo.Api.Model.Common;
using Depo.Data.Models;
using Depo.Data.Models.Attributes;
using Depo.Data.Models.Common;
using Depo.Data.Models.Extension;
using Depo.Data.Models.Minio;
using Depo.Data.Models.Utility;
using Depo.Data.Models.Vehicle;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Depo.Api.Controllers.Vehicle
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class VehicleBrandController : ControllerBase
    {
        private readonly DepoDbContext _context;
        private readonly MinioSettings _minioSettings;

        public VehicleBrandController(DepoDbContext context, MinioSettings minioSettings)
        {
            _context = context;
            _minioSettings = minioSettings;
        }

        [HttpGet]
        [PermissionRequirement(only: "canReadVehicleBrand")]
        public async Task<DepoApiResponse> GetAllBrands()
        {
            var res = new DepoApiResponse(false);
            try
            {
                var cities = await _context.VehicleBrand.Where(x => x.IsActive && !x.IsDeleted).OrderBy(p => p.BrandName).ToListAsync();

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
        [PermissionRequirement(only: "canReadVehicleBrand")]
        public async Task<DepoApiResponse> Find([FromHeader] QueryParam<FilterQuery> queryParam)
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            int pageSize = queryParam.PageSize;
            int pageNumber = queryParam.PageNumber;
            var filter = queryParam.FilterData;

            try
            {
                var query = _context.VehicleBrand.Where(p => !p.IsDeleted);

                if (filter != null)
                {
                    if (filter.Status.HasValue)
                    {
                        query = query.Where(a => a.IsActive == filter.Status);
                    }

                    if (!string.IsNullOrEmpty(filter.SearchText))
                    {
                        query = query.Where(u => u.BrandName.Contains(filter.SearchText)
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
        [PermissionRequirement(only: "canCreateVehicleBrand")]
        public async Task<DepoApiResponse> Create(VehicleBrand model)
        {
            var res = new DepoApiResponse(false);

            try
            {
                if (string.IsNullOrEmpty(model.BrandName))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    model.BrandName = model.BrandName.Trim();
                }

                var existsName = await _context.VehicleBrand.AnyAsync(x => !x.IsDeleted && x.BrandName == model.BrandName);
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
                await _context.VehicleBrand.AddAsync(model);

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
        [PermissionRequirement(only: "canUpdateVehicleBrand")]
        public async Task<DepoApiResponse> Update(long id, VehicleBrand model)
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

                var updatedModel = await _context.VehicleBrand.Where(x => x.Id == id).FirstOrDefaultAsync();

                if (updatedModel == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (string.IsNullOrEmpty(model.BrandName))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }
                else
                {
                    model.BrandName = model.BrandName.Trim();
                }

                var existsName = _context.VehicleBrand.Any(x => !x.IsDeleted && x.BrandName == model.BrandName && x.Id != id);
                if (existsName)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "ALREADY_EXISTS_NAME";
                    Console.WriteLine(res.Message);
                    return res;
                }

                updatedModel.BrandName = model.BrandName;
                updatedModel.ModifiedDate = DateTime.UtcNow;
                updatedModel.ModifierUserId = Utility.GetCurrentUser(User).Id;
                updatedModel.FilePath = model.FilePath;
                updatedModel.FileName = model.FileName;
                updatedModel.Description = model.Description;
                updatedModel.FileSize = model.FileSize;

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
        [PermissionRequirement(only: "canDeleteVehicleBrand")]
        public async Task<DepoApiResponse> Delete(long id)
        {
            var res = new DepoApiResponse(false);

            try
            {

                var deletedModel = await _context.VehicleBrand.FindAsync(id);
                if (deletedModel == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                deletedModel.ModifiedDate = DateTime.UtcNow;
                deletedModel.ModifierUserId = Utility.GetCurrentUser(User).Id;
                deletedModel.IsDeleted = true;
                _context.VehicleBrand.Update(deletedModel);

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

        [HttpPost("upload")]
        [DisableRequestSizeLimit]
        public async Task<DepoApiResponse> UploadLogo(IFormFile file)
        {
            var result = new DepoApiResponse(false);

            try
            {
                if (file != null && file.Length != 0)
                {
                    bool extensionError = false;
                    switch (Path.GetExtension(file.FileName).ToLower())
                    {
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

                    string bucketName = "arac-marka";

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

        [HttpPost("getimagebyfilepath")]
        public async Task<DepoApiResponse> GetImageByFilepath(VehicleBrand model)
        {
            var result = new DepoApiResponse(false);

            try
            {
                using (var file = new MemoryStream())
                {
                    string bucketName = "arac-marka";
                    var minioClient = new MinioConnection(_minioSettings).Open();

                    await minioClient.GetObjectAsync(bucketName, model.FilePath,
                       (stream) =>
                       {
                           stream.CopyTo(file);
                       });

                    file.Position = 0;

                    result.IsSuccess = true;
                    result.Type = DepoApiMessageType.NONE;
                    result.Data = Convert.ToBase64String(file.ToArray());
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }

            return result;
        }

    }
}
