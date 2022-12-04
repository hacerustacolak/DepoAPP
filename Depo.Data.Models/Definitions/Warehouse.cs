using Depo.Data.Models.Common;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Depo.Data.Models.Definitions
{
    public class Warehouse : DbRecordBase
    {
        [StringLength(100)]
        public string WarehouseName { get; set; }

        [StringLength(100)]
        public string LogoCode { get; set; }

        [StringLength(100)]
        public string City { get; set; }

        [StringLength(100)]
        public string Address { get; set; }

        [StringLength(100)]
        public string Phone { get; set; }


        [StringLength(100)]
        public string Representative { get; set; }
    }

    public class WarehouseView
    {

    }
}
