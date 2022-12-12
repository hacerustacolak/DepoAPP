using Depo.Data.Models.Common;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Depo.Data.Models.Crm
{
	public class Merchant : DbRecordBase
	{
		public long CompanyId { get; set; }

		[StringLength(255)]
		public string MerchantName { get; set; }

		[StringLength(255)]
		public string AliasName { get; set; }

		[StringLength(255)]
		public string LogoCode { get; set; }

		[StringLength(255)]
		public string City { get; set; }

		[StringLength(255)]
		public string Representive { get; set; }

		public long RegionId { get; set; }

		[StringLength(1000)]
		public string Address { get; set; }

		[StringLength(25)]
		public string Phone { get; set; }

		[StringLength(50)]
		public string Email { get; set; }

		[StringLength(255)]
		public string WebSiteUrl { get; set; }

		public bool HasService { get; set; }
		public int Depo1Id { get; set; }
		public int Depo2Id { get; set; }

		public long CompetitorsId { get; set; }

		public DateTime ContractEndDate { get; set; }

		public DateTime TenderDate { get; set; }

		public int ContractPeriod { get; set; }

		public long CustomerRepresentativeId { get; set; }

		public int PersonalCount { get; set; }

		public int ShiftCount { get; set; }

		public int VehicleCount { get; set; }

		public bool IsSpecialTransfer { get; set; }

		[StringLength(2000)]
		public string VehicleDetailJson { get; set; }

		[NotMapped]
		private List<VehicleDetail> _VehicleDetail;
		[NotMapped]
		public List<VehicleDetail> VehicleDetail
		{
			get
			{

				if (!string.IsNullOrEmpty(this.VehicleDetailJson))
					_VehicleDetail = JsonConvert.DeserializeObject<List<VehicleDetail>>(VehicleDetailJson);

				return _VehicleDetail;
			}
			set
			{
				_VehicleDetail = value;
			}
		}



		[StringLength(100)]
		public string Longitude { get; set; }

		[StringLength(100)]
		public string Latitude { get; set; }
	}

	public class VehicleDetail
	{
		public long VehicleCapacityId { get; set; }
		public string VehicleCount { get; set; }
	}


	public class MerchantView
	{
		public long Id { get; set; }
		public long CompanyId { get; set; }
		public string CompanyName { get; set; }
		public string RegionName { get; set; }
		public string MerchantName { get; set; }
		public string AliasName { get; set; }
		public string Address { get; set; }
		public long RegionId { get; set; }
		public string Phone { get; set; }
		public string Email { get; set; }
		public string WebSiteUrl { get; set; }
		public string Description { get; set; }
		public string Longitude { get; set; }
		public string Latitude { get; set; }
		public string GroupName { get; set; }
		public string City { get; set; }
		public string LogoCode { get; set; }
		public string Representive { get; set; }
		public string CreateDate { get; set; }
		public int Depo1Id { get; set; }
		public int Depo2Id { get; set; }
        public string Depo1Name { get; set; }
        public string Depo2Name { get; set; }

    }

}
