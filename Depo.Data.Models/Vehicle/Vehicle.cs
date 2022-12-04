using Depo.Data.Models.Common;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Depo.Data.Models.Vehicle
{
    public class Vehicle : DbRecordBase
    {
        public long SCVehicleTypeId { get; set; }

        [StringLength(15)]
        public string VehiclePlate { get; set; }
        public long VehicleTrackingDeviceCompanyId { get; set; }

        [StringLength(50)]
        public string VehicleTrackingDeviceNo { get; set; }
        public long VehicleModelId { get; set; }
        public decimal VehicleRental { get; set; }
        public long VehicleCapacityId { get; set; }
        public int VehicleModelYear { get; set; }
        public long SubcontractorId { get; set; }
        public decimal GpsPrice { get; set; }

        [StringLength(5000)]
        public string VehiclePhotos { get; set; }

        [StringLength(1000)]
        public string VehicleLicense { get; set; }

        [StringLength(1000)]
        public string VehicleTrafficInsurance { get; set; }

        [StringLength(1000)]
        public string VehicleIMMS { get; set; }

        [StringLength(1000)]
        public string VehicleInspection { get; set; }

        [StringLength(1000)]
        public string VehicleMaintenance { get; set; }


        [NotMapped]
        public List<VehicleFileModel> VehiclePhotoList
        {
            get
            {

                if (!string.IsNullOrEmpty(this.VehiclePhotos))
                    return JsonConvert.DeserializeObject<List<VehicleFileModel>>(this.VehiclePhotos);

                return null;
            }
            set
            {
                this.VehiclePhotos = JsonConvert.SerializeObject(value);
            }
        }

        [NotMapped]
        public VehicleFileWithDate VehicleLisenceList
        {
            get
            {

                if (!string.IsNullOrEmpty(this.VehicleLicense))
                    return JsonConvert.DeserializeObject<VehicleFileWithDate>(this.VehicleLicense);

                return null;
            }
            set
            {
                this.VehicleLicense = JsonConvert.SerializeObject(value);
            }
        }

        [NotMapped]
        public VehicleFileWithDate VehicleTrafficInsuranceList
        {
            get
            {

                if (!string.IsNullOrEmpty(this.VehicleTrafficInsurance))
                    return JsonConvert.DeserializeObject<VehicleFileWithDate>(this.VehicleTrafficInsurance);

                return null;
            }
            set
            {
                this.VehicleTrafficInsurance = JsonConvert.SerializeObject(value);
            }
        }

        [NotMapped]
        public VehicleFileWithDate VehicleTrafficIMMSList
        {
            get
            {

                if (!string.IsNullOrEmpty(this.VehicleIMMS))
                    return JsonConvert.DeserializeObject<VehicleFileWithDate>(this.VehicleIMMS);

                return null;
            }
            set
            {
                this.VehicleIMMS = JsonConvert.SerializeObject(value);
            }
        }

        [NotMapped]
        public VehicleFileWithDate VehicleInspectionList
        {
            get
            {

                if (!string.IsNullOrEmpty(this.VehicleInspection))
                    return JsonConvert.DeserializeObject<VehicleFileWithDate>(this.VehicleInspection);

                return null;
            }
            set
            {
                this.VehicleInspection = JsonConvert.SerializeObject(value);
            }
        }

        [NotMapped]
        public VehicleFileMaintenanceModel VehicleMaintenanceList
        {
            get
            {

                if (!string.IsNullOrEmpty(this.VehicleMaintenance))
                    return JsonConvert.DeserializeObject<VehicleFileMaintenanceModel>(this.VehicleMaintenance);

                return null;
            }
            set
            {
                this.VehicleMaintenance = JsonConvert.SerializeObject(value);
            }
        }

        [NotMapped]
        public string VehicleModelName { get; set; }

        [NotMapped]
        public long VehicleBrandId { get; set; }

        [NotMapped]
        public string VehicleBrandName { get; set; }

        [NotMapped]
        public string SCVehicleTypeName { get; set; }

        [NotMapped]
        public string VehicleCapacityName { get; set; }

        [NotMapped]
        public int MaintenancePeriodKM { get; set; }

        [NotMapped]
        public int MaintenancePeriodYear { get; set; }
    }

    public class VehicleFileWithDate
    {
        public string FileName { get; set; }
        public int FileLength { get; set; }
        public string FilePath { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

    }

    public class VehicleFileModel
    {
        public string FileName { get; set; }
        public int FileLength { get; set; }
        public string FilePath { get; set; }
    }

    public class VehicleFileMaintenanceModel
    {
        public string FileName { get; set; }
        public int FileLength { get; set; }
        public string FilePath { get; set; }
        public DateTime? EndDate { get; set; }
        public int? LastMaintenanceKM { get; set; }
    }

    public class VehicleDocResponse
    {
        public List<VehicleImagesModel> images { get; set; }
    }

    public class VehicleImagesModel
    {
        public string FilePath { get; set; }
        public string FileBase64 { get; set; }
    }
}
