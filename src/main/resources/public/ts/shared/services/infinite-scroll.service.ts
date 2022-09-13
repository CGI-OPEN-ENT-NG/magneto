import {Observable, Subject} from "rxjs";


export class InfiniteScrollService {
    private infiniteScrollSubject: Subject<void> = new Subject<void>();

    updateScroll(): void {
        this.infiniteScrollSubject.next();
    }

    getInfiniteScroll(): Observable<void> {
        return this.infiniteScrollSubject.asObservable();
    }

}