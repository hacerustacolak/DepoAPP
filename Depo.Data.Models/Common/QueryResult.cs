using System.Collections.Generic;

namespace Depo.Api.Model.Common
{
    public class QueryResult<T>
    {
        public T Items { get; set; }
        public long TotalCount { get; set; }
        public IEnumerable<long> AllIds { get; set; }
    }
}
