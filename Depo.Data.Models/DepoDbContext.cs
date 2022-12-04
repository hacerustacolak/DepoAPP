using System.Linq;
using Microsoft.EntityFrameworkCore.Metadata;
using System.Threading;
using System.Threading.Tasks;
using Depo.Data.Models.Security;
using Microsoft.EntityFrameworkCore;
using Depo.Data.Models.Definitions;
using Depo.Data.Models.Crm;
using Depo.Data.Models.Vehicle;

namespace Depo.Data.Models
{
    public class DepoDbContext : DbContext
    {

        public DepoDbContext(DbContextOptions options)
            : base(options)
        {

        }

        public DbSet<User> Users { get; set; }
        public DbSet<Role> Roles { get; set; }
        public DbSet<UserRole> UserRoles { get; set; }
        public DbSet<Hierarchies> Hierarchies { get; set; }
        public DbSet<UserHierarchies> UserHierarchies { get; set; }
        public DbSet<City> City { get; set; }
        public DbSet<Region> Region { get; set; }
        public DbSet<Competitors> Competitors { get; set; }
        public DbSet<Company> Company { get; set; }
        public DbSet<Group> Group { get; set; }
        public DbSet<Merchant> Merchant { get; set; }
        public DbSet<MerchantCurrentAccount> MerchantCurrentAccount { get; set; }
        public DbSet<Otp> Otps { get; set; }
        public DbSet<VehicleBrand> VehicleBrand { get; set; }
        public DbSet<VehicleCapacity> VehicleCapacity { get; set; }
        public DbSet<VehicleModel> VehicleModel { get; set; }
        public DbSet<VehicleType> VehicleType { get; set; }
        public DbSet<MerchantContract> MerchantContract { get; set; }
        public DbSet<MerchantContact> MerchantContact { get; set; }
        public DbSet<MerchantInterviewType> MerchantInterviewType { get; set; }
        public DbSet<MerchantInterview> MerchantInterview { get; set; }
        public DbSet<MerchantOffer> MerchantOffer { get; set; }
        public DbSet<MerchantOfferFile> MerchantOfferFile { get; set; }
        public DbSet<SCVehicleType> SCVehicleType { get; set; }
        public DbSet<VehicleTrackingDeviceCompany> VehicleTrackingDeviceCompany { get; set; }
        public DbSet<Vehicle.Vehicle> Vehicle { get; set; }
        public DbSet<Warehouse> Warehouse { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
        }

        public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {

            try
            {
                var modifiedEntities = ChangeTracker.Entries()
                    .Where(p => p.State == EntityState.Modified || p.State == EntityState.Added || p.State == EntityState.Deleted).ToList();
                var now = System.DateTime.UtcNow;

                if (modifiedEntities != null && modifiedEntities.Any())
                {
                    foreach (var change in modifiedEntities)
                    {
                        var entityName = change.Entity.GetType().Name;

                        if (entityName.Equals("UserLog")
                            )
                        {
                            continue;
                        }

                        int modifierUserId = 0;
                        if (change.CurrentValues.Properties.Any(p => p.Name == "ModifierUserId"))
                            modifierUserId = int.Parse(change.CurrentValues["ModifierUserId"].ToString());

                        int creatorUserId = 0;
                        if (change.CurrentValues.Properties.Any(p => p.Name == "CreatorUserId"))
                            creatorUserId = int.Parse(change.CurrentValues["CreatorUserId"].ToString());

                        if (modifierUserId <= 0 && change.State == EntityState.Added) // create
                        {
                            //UserLog log = new UserLog();
                            //log.CreateDate = now;
                            //log.CreatorUserId = creatorUserId;
                            //log.EntityName = entityName;
                            //log.IsActive = true;
                            //log.IsDeleted = false;
                            //log.ModifiedDate = now;
                            //log.ModifierUserId = modifierUserId;
                            //log.Action = change.State.ToString();
                            //this.UserLogs.Add(log);
                        }
                        else if (!entityName.Equals("UserLog") && modifierUserId > 0)
                        {
                            var xProperty = change.OriginalValues.Properties.FirstOrDefault(prop => prop.IsPrimaryKey() == true);
                            string PrimaryKey = xProperty != null ? xProperty.Name : string.Empty;

                            foreach (IProperty prop in change.OriginalValues.Properties)
                            {
                                object originalValue = null, currentValue = null;

                                if (change.OriginalValues.Properties.Any(p => p.Name == prop.Name))
                                    originalValue = change.OriginalValues[prop.Name];

                                if (change.CurrentValues.Properties.Any(p => p.Name == prop.Name))
                                    currentValue = change.CurrentValues[prop.Name];

                                if (originalValue != currentValue) //Sadece Değişen kayıt Log'a atılır.
                                {
                                    //UserLog log = new UserLog();
                                    //log.CreateDate = now;
                                    //log.CreatorUserId = creatorUserId;
                                    //log.EntityName = entityName;
                                    //log.FieldName = prop.Name;
                                    //log.IsActive = true;
                                    //log.IsDeleted = false;
                                    //log.ModifiedDate = now;
                                    //log.ModifierUserId = modifierUserId;
                                    //log.NewValue = currentValue == null ? null : currentValue.ToString();
                                    //log.OldValue = originalValue == null ? null : originalValue.ToString();
                                    //log.PrimaryKeyValue = 0;
                                    //if (change.OriginalValues.Properties.Any(p => p.Name == PrimaryKey))
                                    //    log.PrimaryKeyValue = int.Parse(change.OriginalValues[PrimaryKey].ToString());

                                    //log.Action = change.State.ToString();

                                    //this.UserLogs.Add(log);
                                }
                            }
                        }
                    }
                }
            }
            catch
            {

            }

            return base.SaveChangesAsync(cancellationToken);
        }

        public override int SaveChanges()
        {
            return this.SaveChangesAsync().Result;
        }
    }
}
