import { Component, OnInit, ViewChild, ElementRef, Output, EventEmitter, ViewChildren } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { HttpClient } from '@angular/common/http';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-recommendation-popup',
  templateUrl: './recommendation-popup.component.html',
  styleUrls: ['./recommendation-popup.component.scss']
})
export class RecommendationPopupComponent implements OnInit {

  @Output() action = new EventEmitter<boolean>();
  
  ngOnInit() {}

  @ViewChild('content') savePopup: ElementRef;
  @ViewChildren('textInput') textInput: ElementRef;

  ngOnChanges(change){}

  closeResult: string;
  constructor(public modalService: NgbModal, private fb: FormBuilder, private http: HttpClient) {}

  public open(content = this.savePopup){
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg', backdrop: 'static' }).result.then((result) => {
      this.closeResult = `${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  takeAction(txt, modal){
    this.action.emit(txt);
    modal.dismiss('text to contract');
  }

  onKeydown(event,txt,modal){
    this.action.emit(txt);
    modal.dismiss('text to contract');
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

}


                            