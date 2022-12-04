using Depo.Data.Models.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Depo.Data.Models.Crm
{
    public class MerchantOfferFile : DbRecordBase
    {
        public long MerchantId { get; set; }
        public long MerchantOfferId { get; set; }

        [StringLength(50)]
        public string FilePath { get; set; }
        public int FileSize { get; set; }

        [StringLength(100)]
        public string FileName { get; set; }
        [StringLength(50)]
        public string FileType { get; set; }


    }
}
