using Depo.Data.Models.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Depo.Data.Models.Crm
{
    public class MerchantOffer : DbRecordBase
    {
        public long MerchantId { get; set; }
        public decimal DriverCost { get; set; }
        public decimal ProjectManagerCost { get; set; }
        public decimal ControlToolCost { get; set; }
        public int ControlToolCount { get; set; }
        public decimal FuelLiterFee { get; set; }
        public decimal FuelCommissionRate { get; set; }
        public decimal LetterOfGuaranteeFee { get; set; }
        public decimal AnnualFinancingFee { get; set; }
        public decimal ProfitMultiplier { get; set; }
        public decimal MiniRentalFee { get; set; }
        public decimal MidiRentalFee { get; set; }
        public decimal BusRentalFee { get; set; }
        public decimal CarRentalFee { get; set; }
        public decimal CustomerMaturity { get; set; }
        public decimal SubcontractorMaturity { get; set; }
        public decimal FuelMaturity { get; set; }

        [StringLength(20)]
        public string Status { get; set; }

        [NotMapped]
        public string UserName { get; set; }

        [NotMapped]
        public string FilePath { get; set; }

        [NotMapped]
        public int FileSize { get; set; }

        [NotMapped]
        public string FileName { get; set; }

        [NotMapped]
        public string FileType { get; set; }

        [NotMapped]
        public List<MerchantOfferFile> MerchantOfferFile { get; set; }
    }
}
