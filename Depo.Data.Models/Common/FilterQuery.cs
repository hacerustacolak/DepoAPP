using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Depo.Data.Models.Common
{
    public class FilterQuery
    {
        public string SearchText { get; set; }
        public bool? Status { get; set; }
    }
    public class FilterWithMerchantQuery
    {
        public string SearchText { get; set; }
        public long MerchantId { get; set; }
    }
}
