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
using System.IO;
using System.Linq;
using System.Threading.Tasks;
namespace Depo.Api.Controllers.Vehicle
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class VehicleController : ControllerBase
    {
        private readonly DepoDbContext _context;
        private readonly MinioSettings _minioSettings;

        public VehicleController(DepoDbContext context, MinioSettings minioSettings)
        {
            _context = context;
            _minioSettings = minioSettings;
        }

        [HttpGet("find")]
        [PermissionRequirement(only: "canReadVehicle")]
        public async Task<DepoApiResponse> Find([FromHeader] QueryParam<FilterQuery> queryParam)
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            int pageSize = queryParam.PageSize;
            int pageNumber = queryParam.PageNumber;
            var filter = queryParam.FilterData;

            try
            {
                var query = from v in _context.Vehicle.Where(p => !p.IsDeleted)
                            join sctype in _context.SCVehicleType.Where(p => !p.IsDeleted) on v.SCVehicleTypeId equals sctype.Id
                            join m in _context.VehicleModel.Where(p => !p.IsDeleted) on v.VehicleModelId equals m.Id
                            join b in _context.VehicleBrand.Where(p => !p.IsDeleted) on m.VehicleBrandId equals b.Id
                            join c in _context.VehicleCapacity.Where(p => !p.IsDeleted) on v.VehicleCapacityId equals c.Id
                            select new Data.Models.Vehicle.Vehicle()
                            {
                                GpsPrice = v.GpsPrice,
                                Description = v.Description,
                                ModifiedDate = v.ModifiedDate,
                                Id = v.Id,
                                SCVehicleTypeId = v.SCVehicleTypeId,
                                SCVehicleTypeName = sctype.SCVehicleName,
                                SubcontractorId = v.SubcontractorId,
                                VehicleCapacityId = v.VehicleCapacityId,
                                VehicleCapacityName = c.CapacityName,
                                VehicleLisenceList = v.VehicleLisenceList,
                                VehicleMaintenanceList = v.VehicleMaintenanceList,
                                VehicleModelId = v.VehicleModelId,
                                VehicleModelName = String.Concat(b.BrandName, " ", m.ModelName),
                                VehicleModelYear = v.VehicleModelYear,
                                VehiclePhotoList = v.VehiclePhotoList,
                                VehiclePlate = v.VehiclePlate,
                                VehicleRental = v.VehicleRental,
                                VehicleTrackingDeviceCompanyId = v.VehicleTrackingDeviceCompanyId,
                                VehicleTrafficInsuranceList = v.VehicleTrafficInsuranceList,
                                VehicleTrackingDeviceNo = v.VehicleTrackingDeviceNo,
                                VehicleTrafficIMMSList = v.VehicleTrafficIMMSList,
                                VehicleBrandId = b.Id,
                                MaintenancePeriodKM = m.MaintenancePeriodKM,
                                MaintenancePeriodYear = m.MaintenancePeriodYear,
                                VehicleInspectionList = v.VehicleInspectionList,
                            };

                if (filter != null)
                {
                    if (filter.Status.HasValue)
                    {
                        query = query.Where(a => a.IsActive == filter.Status);
                    }

                    if (!string.IsNullOrEmpty(filter.SearchText))
                    {
                        query = query.Where(u => u.VehiclePlate.Contains(filter.SearchText)
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
        [PermissionRequirement(only: "canCreateVehicle")]
        public async Task<DepoApiResponse> Create(Data.Models.Vehicle.Vehicle model)
        {
            var res = new DepoApiResponse(false);

            try
            {
                #region Check Paremeters

                if (model.SCVehicleTypeId <= 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_VEHICLE_TYPE";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (model.SubcontractorId <= 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_SUBCONTRACTOR";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (string.IsNullOrEmpty(model.VehiclePlate))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_PLATE";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (model.VehicleModelId <= 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_VEHICLE_MODEL";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (model.VehicleCapacityId <= 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_VEHICLE_CAPACITY";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (model.VehicleModelYear < 2000)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_VEHICLE_YEAR";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (model.VehicleTrafficInsuranceList != null && model.VehicleTrafficInsuranceList.FileLength > 0 && (!model.VehicleTrafficInsuranceList.StartDate.HasValue || !model.VehicleTrafficInsuranceList.EndDate.HasValue))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_TRAFFIC_INSURANCE_DATE";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (model.VehicleTrafficIMMSList != null && model.VehicleTrafficIMMSList.FileLength > 0 && (!model.VehicleTrafficIMMSList.StartDate.HasValue || !model.VehicleTrafficIMMSList.EndDate.HasValue))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_TRAFFIC_IMMS_DATE";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (model.VehicleLisenceList != null && model.VehicleLisenceList.FileLength > 0 && (!model.VehicleLisenceList.StartDate.HasValue || !model.VehicleLisenceList.EndDate.HasValue))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_LISENCE_DATE";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (model.VehicleMaintenanceList != null && model.VehicleMaintenanceList.FileLength > 0 && (!model.VehicleMaintenanceList.EndDate.HasValue || !model.VehicleMaintenanceList.LastMaintenanceKM.HasValue))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_MAINTENANCE_DATE_OR_LASTMAINTENANCEKM ";
                    Console.WriteLine(res.Message);
                    return res;
                }

                #endregion

                model.VehiclePlate = model.VehiclePlate.ToUpper();

                #region Check Plate

                var checkPlate = await _context.Vehicle.Where(p => p.VehiclePlate == model.VehiclePlate && !p.IsDeleted).FirstOrDefaultAsync();
                if (checkPlate != null)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "THIS_PLATE_IS_USED";
                    Console.WriteLine(res.Message);
                    return res;
                }

                #endregion
                model.IsActive = true;
                model.CreateDate = DateTime.UtcNow;
                model.CreatorUserId = Utility.GetCurrentUser(User).Id;
                model.ModifiedDate = DateTime.UtcNow;
                await _context.Vehicle.AddAsync(model);

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
        [PermissionRequirement(only: "canUpdateVehicle")]
        public async Task<DepoApiResponse> Update(long id, Data.Models.Vehicle.Vehicle model)
        {
            var res = new DepoApiResponse(false);

            try
            {
                #region Check Parameters

                if (id != model.Id)
                {
                    res.Message = "BAD_REQUEST";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (model.SCVehicleTypeId < 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_VEHICLE_TYPE";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (model.SubcontractorId < 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_SUBCONTRACTOR";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (string.IsNullOrEmpty(model.VehiclePlate))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_PLATE";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (model.VehicleModelId < 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_VEHICLE_MODEL";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (model.VehicleCapacityId < 0)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_VEHICLE_CAPACITY";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (model.VehicleModelYear < 2000)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_VEHICLE_CAPACITY";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (model.VehicleTrafficInsuranceList != null && model.VehicleTrafficInsuranceList.FileLength > 0 && (!model.VehicleTrafficInsuranceList.StartDate.HasValue || !model.VehicleTrafficInsuranceList.EndDate.HasValue))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_TRAFFIC_INSURANCE_DATE";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (model.VehicleTrafficIMMSList != null && model.VehicleTrafficIMMSList.FileLength > 0 && (!model.VehicleTrafficIMMSList.StartDate.HasValue || !model.VehicleTrafficIMMSList.EndDate.HasValue))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_TRAFFIC_IMMS_DATE";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (model.VehicleLisenceList != null && model.VehicleLisenceList.FileLength > 0 && (!model.VehicleLisenceList.StartDate.HasValue || !model.VehicleLisenceList.EndDate.HasValue))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_LISENCE_DATE";
                    Console.WriteLine(res.Message);
                    return res;
                }

                if (model.VehicleMaintenanceList != null && model.VehicleMaintenanceList.FileLength > 0 && (!model.VehicleMaintenanceList.EndDate.HasValue || !model.VehicleMaintenanceList.LastMaintenanceKM.HasValue))
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "MISSING_PARAMETER_MAINTENANCE_DATE_OR_LASTMAINTENANCEKM ";
                    Console.WriteLine(res.Message);
                    return res;
                }

                #endregion

                #region Check Plate

                model.VehiclePlate = model.VehiclePlate.ToUpper();

                var checkPlate = await _context.Vehicle.Where(p => p.VehiclePlate == model.VehiclePlate && !p.IsDeleted && id != p.Id).FirstOrDefaultAsync();
                if (checkPlate != null)
                {
                    res.Type = DepoApiMessageType.Form;
                    res.Message = "THIS_PLATE_IS_USED";
                    Console.WriteLine(res.Message);
                    return res;
                }

                #endregion

                #region Get Model By Id

                var updatedModel = await _context.Vehicle.Where(x => x.Id == id).FirstOrDefaultAsync();

                if (updatedModel == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                #endregion

                #region Prepare Model For Update

                updatedModel.VehicleTrafficInsurance = model.VehicleTrafficInsurance;
                updatedModel.VehicleIMMS = model.VehicleIMMS;
                updatedModel.VehicleCapacityId = model.VehicleCapacityId;
                updatedModel.VehicleLicense = model.VehicleLicense;
                updatedModel.VehiclePlate = model.VehiclePlate;
                updatedModel.VehiclePhotos = model.VehiclePhotos;
                updatedModel.VehicleMaintenance = model.VehicleMaintenance;
                updatedModel.VehicleModelId = model.VehicleModelId;
                updatedModel.VehicleModelYear = model.VehicleModelYear;
                updatedModel.VehicleRental = model.VehicleRental;
                updatedModel.VehicleTrackingDeviceCompanyId = model.VehicleTrackingDeviceCompanyId;
                updatedModel.VehicleTrackingDeviceNo = model.VehicleTrackingDeviceNo;
                updatedModel.SubcontractorId = model.SubcontractorId;
                updatedModel.SCVehicleTypeId = model.SCVehicleTypeId;
                updatedModel.GpsPrice = model.GpsPrice;
                updatedModel.ModifiedDate = DateTime.UtcNow;
                updatedModel.ModifierUserId = Utility.GetCurrentUser(User).Id;
                updatedModel.Description = model.Description;
                updatedModel.VehicleInspection = model.VehicleInspection;

                #endregion

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
        [PermissionRequirement(only: "canDeleteVehicle")]
        public async Task<DepoApiResponse> Delete(long id)
        {
            var res = new DepoApiResponse(false);

            try
            {

                var deletedModel = await _context.Vehicle.FindAsync(id);
                if (deletedModel == null)
                {
                    res.Message = "RECORD_NOT_FOUND";
                    Console.WriteLine(res.Message);
                    return res;
                }

                deletedModel.ModifiedDate = DateTime.UtcNow;
                deletedModel.ModifierUserId = Utility.GetCurrentUser(User).Id;
                deletedModel.IsDeleted = true;
                _context.Vehicle.Update(deletedModel);

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

        [HttpGet("images-{id}")]
        [PermissionRequirement(only: "canReadVehicle")]
        public async Task<DepoApiResponse> GetImagesById(long id)
        {
            var res = new DepoApiResponse(false);
            var usr = Utility.GetCurrentUser(User);

            try
            {
                var vehicleRes = new VehicleDocResponse();
                vehicleRes.images = new List<VehicleImagesModel>();

                Data.Models.Vehicle.Vehicle vehicle = await _context.Vehicle.Where(p => p.Id == id).Select(p => new Data.Models.Vehicle.Vehicle() { Id = p.Id, VehiclePhotos = p.VehiclePhotos }).FirstOrDefaultAsync();

                if (vehicle != null)
                {
                    if (vehicle.VehiclePhotoList != null && vehicle.VehiclePhotoList.Any())
                    {                        
                        foreach (var item in vehicle.VehiclePhotoList)
                        {
                            var imgRes = await this.GetImageByFilepath(new VehicleFileModel() { FilePath = item.FilePath });
                            vehicleRes.images.Add(new VehicleImagesModel() { FilePath = item.FilePath, FileBase64 = (string)imgRes.Data });
                        }
                    }

                    if (vehicle.VehicleLisenceList != null)
                    {
                        var imgRes = await this.GetImageByFilepath(new VehicleFileModel() { FilePath = vehicle.VehicleLisenceList.FilePath });
                        vehicleRes.images.Add(new VehicleImagesModel() { FilePath = vehicle.VehicleLisenceList.FilePath, FileBase64 = (string)imgRes.Data });
                    }
                }

                res = new DepoApiResponse(true);
                res.Data = vehicleRes;

                return res;
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
                return res;
            }
        }

        [HttpPost("upload-image")]
        [DisableRequestSizeLimit]
        public async Task<DepoApiResponse> UploadImage(IFormFile file)
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

                    string bucketName = "vehicle";

                    var minioClient = new MinioConnection(_minioSettings).Open();
                    bool hasBucket = await minioClient.BucketExistsAsync(bucketName);
                    if (!hasBucket)
                    {
                        await minioClient.MakeBucketAsync(bucketName, "us-east-1");
                    }

                    var fileExt = Path.GetExtension(file.FileName);
                    var fileName = Guid.NewGuid();
                    var filePath = fileName + fileExt;

                    string fileBase64 = "";
                    using (Stream stream = file.OpenReadStream())
                    {
                        using (MemoryStream ms = new MemoryStream())
                        {
                            stream.CopyTo(ms);
                            ms.Position = 0;

                            fileBase64 = Convert.ToBase64String(ms.ToArray());

                            await minioClient.PutObjectAsync(bucketName, filePath, ms, file.Length, "application/octet-stream");
                        }
                    }

                    result.IsSuccess = true;
                    result.Type = DepoApiMessageType.NONE;
                    result.Data = new
                    {
                        FileName = file.FileName,
                        FileSize = file.Length,
                        FilePath = filePath,
                        fileBase64 = fileBase64
                    };
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }

            return result;
        }

        [HttpPost("upload-document")]
        [DisableRequestSizeLimit]
        public async Task<DepoApiResponse> UploadDocument(IFormFile file)
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

                    string bucketName = "vehicle";

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
        public async Task<DepoApiResponse> GetImageByFilepath(VehicleFileModel model)
        {
            var result = new DepoApiResponse(false);

            try
            {
                using (var file = new MemoryStream())
                {
                    string bucketName = "vehicle";
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

        [HttpPost("getDocumentByFilepath")]
        public async Task<IActionResult> GetDocumentByFilepath(VehicleFileModel model)
        {
            var file = new MemoryStream();

            try
            {
                string bucketName = "vehicle";
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

        //FOR COMBOBOX
        [HttpGet("vehicle-types")]
        [PermissionRequirement(only: "canReadVehicle")]
        public async Task<DepoApiResponse> GetAllSCVehicleTypes()
        {
            var res = new DepoApiResponse(false);
            try
            {
                var result = await _context.SCVehicleType.Where(p => !p.IsDeleted).ToListAsync();

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

        [HttpGet("vehicle-tracking-device-company")]
        [PermissionRequirement(only: "canReadVehicle")]
        public async Task<DepoApiResponse> GetAllVehicleTrackingDeviceCompany()
        {
            var res = new DepoApiResponse(false);
            try
            {
                var result = await _context.VehicleTrackingDeviceCompany.Where(p => !p.IsDeleted).ToListAsync();

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

    }
}
