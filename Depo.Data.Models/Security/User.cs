using Depo.Data.Models.Common;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace Depo.Data.Models.Security
{
    public class User : DbRecordBase
    {
        [StringLength(100)]
        public string Email { get; set; }

        [StringLength(50)]
        public string Name { get; set; }

        [StringLength(50)]
        public string Surname { get; set; }

        [NotMapped]
        public string Password { get; set; }

        [StringLength(100)]
        public string PasswordHash { get; set; }

        public DateTime PasswordUpdateDate { get; set; }

        [StringLength(25)]
        public string PhoneNumber { get; set; }

        public DateTime RegistrationTime { get; set; }

        public long RegionId { get; set; }

        [StringLength(1000)]
        public string Address { get; set; }

        public int FailAttempCount { get; set; }

        [NotMapped]
        public string RegionName { get; set; }
    }

    public class ContactUser
    {
        public long Id { get;set; }
        public string Email { get; set; }

        public string Name { get; set; }

        public string Surname { get; set; }

        public long RegionId { get; set; }

        public string Address { get; set; }

        public string RegionName { get; set; }

        public string Title { get; set; }
        public string Description { get; set; }
        public string PhoneNumber { get; set; }

    }
}
