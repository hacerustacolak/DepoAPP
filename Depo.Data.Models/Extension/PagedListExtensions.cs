using Depo.Api.Model.Common;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Depo.Data.Models.Extension
{
    public static class PagedListExtensions
    {
        public static QueryResult<IEnumerable<T>> ToPagedList<T>(this IEnumerable<T> superset, int pageNumber, int pageSize)
        {
            int iTotalCount = superset.Count();

            List<T> items = null;
            IEnumerable<long> allIds = null;
            if (iTotalCount > 0)
            {
                allIds = superset.Select(p => long.Parse(p.GetType().GetProperty("Id").GetValue(p).ToString())).AsEnumerable();
                items = superset.Skip(pageSize * pageNumber).Take(pageSize).ToList();
            }

            return new QueryResult<IEnumerable<T>>()
            {
                TotalCount = iTotalCount,
                Items = items,
                AllIds = allIds
            };
        }

        public static async Task<QueryResult<IEnumerable<T>>> ToPagedListAsync<T>(this IQueryable<T> superset, int pageNumber, int pageSize)
        {
            int iTotalCount = await superset.CountAsync();

            List<T> items = null;
            IEnumerable<long> allIds = null;
            if (iTotalCount > 0)
            {
                allIds = superset.Select(p=> long.Parse(p.GetType().GetProperty("Id").GetValue(p).ToString())).AsEnumerable();
                items = await superset.Skip(pageSize * pageNumber).Take(pageSize).ToListAsync();
            }

            return new QueryResult<IEnumerable<T>>()
            {
                TotalCount = iTotalCount,
                Items = items,
                AllIds = allIds
            };
        }

        public static IEnumerable<T> SelectManyRecursive<T>(this IEnumerable<T> source, Func<T, IEnumerable<T>> childrenSelector)
        {
            if (source == null)
                yield return default(T);

            if (source != null && source.Any())
            {
                foreach (var i in source)
                {
                    yield return i;
                    var children = childrenSelector(i);
                    if (children != null)
                    {
                        foreach (var child in SelectManyRecursive(children, childrenSelector))
                        {
                            yield return child;
                        }
                    }
                }
            }

        }

        public static async Task<QueryResult<IEnumerable<T>>> ToPagedListAsync<T>(this IEnumerable<T> superset, int pageNumber, int pageSize)
        {
            return new QueryResult<IEnumerable<T>>()
            {
                TotalCount = superset.Count(),
                Items = superset.Skip(pageSize * pageNumber).Take(pageSize).ToList()
            };
        }

    }
}
