using Depo.Data.Models.Common;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Depo.Data.Models.Crm
{
    public class MerchantContract : DbRecordBase
    {
        public long MerchantId { get; set; }
        public DateTime ContractDate { get; set; }
        public decimal FuelProcessingPercentage { get; set; }
        public int FuelCheckPeriod { get; set; }
        public decimal PercentageOfFuelPriceWillBeProcessed { get; set; }
        public decimal InflationProcessingPercentage { get; set; }
        public int InflationCheckPeriod { get; set; }
        public decimal PercentageOfInflationPriceWillBeProcessed { get; set; }
    }
}
