import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Rectangle} from "../models/rectangle.model";
import {environment} from "../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class RectangleService {

  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) { }

  getDimensions(): Observable<Rectangle> {
    return this.http.get<Rectangle>(this.baseUrl+'/rectangle');
  }

  updateDimensions(dimensions: { width: number; height: number }): Observable<Rectangle> {
    return this.http.put<Rectangle>(this.baseUrl+'/rectangle', dimensions);
  }

  downloadJsonFile(): Observable<Blob> {
    return this.http.get(this.baseUrl+'/rectangle/download', { responseType: 'blob' });
  }
}
