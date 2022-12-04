using System;
using System.Collections.Generic;

namespace Depo.Data.Models
{
    public class CurrentUser
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public long Id { get; set; }        
        public string Fullname { get; set; }
        public string Picture { get; set; }
        public IEnumerable<string> Permissions { get; set; }
        public string Currency { get; set; }
        public string Country { get; set; }
        public string Language { get; set; }
        public bool MasterCompany { get; set; }
        public string CompanyCode { get; set; }
        public long CompanyId { get; set; }
        public string CompanyName { get; set; }
        public string ParentHierarchies { get; set; }
        public string UserHierarchies { get; set; }
        public string Timezone { get; set; }
        public bool HasMultiCheckerPermission { get; set; }       
        public long MerchantId { get; set; }
        public string MerchantName { get; set; }
        public bool IsAdmin
        {
            get
            {
                return this.Role == "Admin";
            }
        }
    }
}
