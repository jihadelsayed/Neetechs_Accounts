import { Component, OnInit } from '@angular/core';

import { NgClass } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  standalone: true,
  imports: [RouterModule], 
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent implements OnInit {

constructor(private title: Title) {}

ngOnInit(): void {
  this.title.setTitle('404 - Page Not Found');
}

}
