import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface UserNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  referenceType: string | null;
  referenceId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationPage {
  notifications: UserNotification[];
  unreadCount: number;
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly BASE = `${environment.apiUrl}/api/user/notifications`;
  private readonly OPTS = { withCredentials: true };

  private _unreadCount = new BehaviorSubject<number>(0);
  readonly unreadCount$ = this._unreadCount.asObservable();

  constructor(private http: HttpClient) {}

  get unreadCount(): number { return this._unreadCount.value; }

  fetchUnreadCount(): void {
    this.http.get<any>(`${this.BASE}/unread-count`, this.OPTS).subscribe({
      next: r => this._unreadCount.next(r.data?.unreadCount ?? 0),
      error: () => {},
    });
  }

  list(page = 1, limit = 20, unreadOnly = false): Observable<NotificationPage> {
    const params = `?page=${page}&limit=${limit}${unreadOnly ? '&unread=true' : ''}`;
    return this.http.get<any>(`${this.BASE}${params}`, this.OPTS).pipe(
      map(r => ({
        notifications: (r.data.notifications as any[]).map(this.deserialize),
        unreadCount:   r.data.unreadCount as number,
        pagination:    r.data.pagination,
      })),
      tap(d => this._unreadCount.next(d.unreadCount))
    );
  }

  markRead(id: string): Observable<void> {
    return this.http.patch<any>(`${this.BASE}/${id}/read`, {}, this.OPTS).pipe(
      tap(() => {
        const n = this._unreadCount.value;
        if (n > 0) this._unreadCount.next(n - 1);
      }),
      map(() => undefined)
    );
  }

  markAllRead(): Observable<number> {
    return this.http.patch<any>(`${this.BASE}/read-all`, {}, this.OPTS).pipe(
      map(r => r.data.updatedCount as number),
      tap(() => this._unreadCount.next(0))
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<any>(`${this.BASE}/${id}`, this.OPTS).pipe(
      map(() => undefined)
    );
  }

  decrementCount(): void {
    const n = this._unreadCount.value;
    if (n > 0) this._unreadCount.next(n - 1);
  }

  private deserialize(n: any): UserNotification {
    return {
      id:            n.id,
      type:          n.type,
      title:         n.title,
      message:       n.message,
      referenceType: n.referenceType ?? null,
      referenceId:   n.referenceId   ?? null,
      isRead:        Boolean(n.isRead),
      readAt:        n.readAt        ?? null,
      createdAt:     n.createdAt,
    };
  }
}
