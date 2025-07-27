export abstract class PaginationHelper {
    static slice(list: any[], page: number, elements_per_page: number) {
        if (!list.length) return []
        const start = elements_per_page * page;
        const end = start + elements_per_page;
        return list.slice(start, end);
    }
}