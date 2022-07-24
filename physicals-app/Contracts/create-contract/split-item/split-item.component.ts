import {Component, ViewChild, Input, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormGroup, FormArray } from '@angular/forms';
import {NgbModal, ModalDismissReasons} from '@ng-bootstrap/ng-bootstrap';
import { ComponentService } from '../../component-service/component.service';
import { ContractObjectService } from '../../contract-service/contract-object.service';

@Component({
  selector: 'split-item',
  templateUrl: './split-item.component.html',
  styleUrls: ['./split-item.component.scss']
})
export class SplitItem {
  closeResult: string;
  splitItemForm: FormGroup;
  arr: FormArray;
  formValues:any;
  deleteItm:any;
  disableAdd: boolean;
  disableDelete: boolean= true;
  msg:string;
  disableSave: boolean=false;
  editLength:number;
  _gmrDetailsQty:any;
  @ViewChild('content')  split;
  @Input() contractDetails;
  @Input() splitRanges;
  @Input() isSplitValid;
  @Input() checkItemQty;
  @Input() splitsAvailableForItem
  @Input() gmrAvailableForItem

@Input()
set gmrDetailsQty(value: boolean) {
    this._gmrDetailsQty = value;
    if(this._gmrDetailsQty > 0){
      this.editRestructureSplit();
    }
}

get gmrDetailsQty(): boolean {
  return this._gmrDetailsQty;
}

  @Input() range;
  @Output() splitAction: EventEmitter<any> = new EventEmitter();

  checktiered$Subscriber
  checkGmr$Subscriber
  
  constructor(private modalService: NgbModal, private fb: FormBuilder,private componentService: ComponentService, private cos: ContractObjectService) {}

  ngOnInit() {
    this.splitItemForm = this.fb.group({
      arr: this.fb.array([this.fb.group({
        rangeStart: [{value:0,disabled:true}],
        rangeEnd: ['']
      })])
    });
    this.addItem();
  }

  ngOnChanges(change) {
    if(change.range){
      this.range = change.range.currentValue;
    }
  }

  sortElementsDowntoUp(elementList){
    elementList.sort((a, b) => {
      a = a.splitId;
      b = b.splitId;
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    });
    return elementList;
  }

  editRestructureSplit(){
    let arr = this.splitItemForm.get('arr') as FormArray;
    arr.controls.length=0;
    let formData:any={};
    formData.arr = [];
    this.editLength = 0;
    if(this.splitRanges){
      this.splitRanges.forEach(element => {
        if(this._gmrDetailsQty > element.splitFloor){
          arr.push(this.fb.group({
            rangeStart: [{value:element.rangeStart,disabled:true}],
            rangeEnd: [{value:element.rangeEnd,disabled:true}]
          }))
          formData.arr.push({
            rangeStart: element.rangeStart,
            rangeEnd: element.rangeEnd,
            showOptions:true
          })
          this.editLength++;
        }else{
          if(element.splitCeiling == this.range){
            arr.push(this.fb.group({
              rangeStart: [{value:element.rangeStart,disabled:true}],
              rangeEnd: [{value:element.rangeEnd,disabled:true}]
            }))
          }else{
            arr.push(this.fb.group({
              rangeStart: [{value:element.rangeStart,disabled:true}],
              rangeEnd: [{value:element.rangeEnd,disabled:false}]
            }))
            this.editLength++;
          }
          formData.arr.push({
            rangeStart: element.rangeStart,
            rangeEnd: element.rangeEnd,
            showOptions:false
          })
        }
      });
      this.splitAction.emit({"splitData": formData})
    }
  }

  open(content) {
    if(this.splitRanges){
      if(this.splitsAvailableForItem && this.splitRanges && this.splitRanges.length>0){
        this.splitRanges = this.sortElementsDowntoUp(this.splitRanges);
        let arr = this.splitItemForm.get('arr') as FormArray;
        arr.controls.length=0;
        let formData:any={};
        formData.arr = [];
        this.splitRanges.forEach(element => {
          arr.push(this.fb.group({
            rangeStart: [{value:element.rangeStart,disabled:true}],
            rangeEnd: [element.rangeEnd]
          }))
          formData.arr.push({
            rangeStart: element.rangeStart,
            rangeEnd: element.rangeEnd
          })
        });   
        this.splitAction.emit({"splitData": formData})
        if(!this.checkItemQty){
            this.disableDelete= false;
        }
      }
      if(this.gmrAvailableForItem){
          this.editRestructureSplit();
      }
    }

    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title', size: 'sm' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });

  }

  inputChangeTrigger(i){
    let arr = this.splitItemForm.get('arr') as FormArray;
    let enableButton = false;
     
    let n = arr.controls.length;
    let re = this.range;
    arr.controls[n-1]["controls"]["rangeEnd"].setValue(re);
    let regNum = /^\d+$/;
    for(let i=0; i < n-1; i++){
      if(!regNum.test(arr.controls[i]["controls"]["rangeEnd"].value)){
        this.disableSave = true;
        this.msg = "enter split ceiling value in numbers only";
        return;
      }
    }
    for(let i=0; i < n-1; i++){
          
         if(arr.controls[i]["controls"]["rangeStart"].value >= arr.controls[i]["controls"]["rangeEnd"].value){
            this.disableSave = true;
            this.msg = "enter correct range";
            break;
         }
         if(arr.controls[i]["controls"]["rangeStart"].value < arr.controls[i]["controls"]["rangeEnd"].value){
            this.disableSave = false;
            this.msg = "";
         }
         if(arr.controls[i]["controls"]["rangeEnd"].value > this.range){
          this.disableSave = true;
          this.msg = "enter correct range";
         }    
    }
    //console.log("detecting",i,n, arr.controls);
    for(let i=0; i < n-1; i++){
         
         if(arr.controls[i]["controls"]["rangeEnd"].value){
            let re = arr.controls[i]["controls"]["rangeEnd"].value;
         arr.controls[i+1]["controls"]["rangeStart"].setValue(re);
         }
         if(!arr.controls[i]["controls"]["rangeEnd"].value){
          this.disableSave = true;
         }
    }

    for(let i=0; i < n-1; i++){

      if(regNum.test(arr.controls[i]["controls"]["rangeEnd"].value)){
        enableButton = true;
      }
    }
    if(enableButton && !this.disableSave){
      this.disableSave = false;
      this.msg="";
    }

    arr.controls[n-1]["controls"]["rangeEnd"].disable();
    let start = arr.controls[n-1]["controls"]["rangeStart"].value;
    let end = arr.controls[n-1]["controls"]["rangeEnd"].value
    if((start == end) && !this.disableSave){
      this.disableSave = true;
      this.msg = "enter correct range";
    }
         
    this.isSplitValid = this.disableSave;
  }

  createItem() {
    return this.fb.group({
      rangeStart: [{value:'',disabled:true}],
      rangeEnd: [{value:'',disabled:true}]
    })
  }

  deleteItem() {
    this.deleteItm = this.splitItemForm.get('arr') as FormArray;
    console.log(this.deleteItm.getRawValue());
    if(this.checkItemQty){
      if(this.deleteItm.controls.length > this.editLength){
        this.deleteItm.removeAt(this.deleteItm.controls.length - 1);
        let n = this.deleteItm.controls.length;
         let re = this.range;
          this.deleteItm.controls[n-1]["controls"]["rangeEnd"].setValue(re);
           this.deleteItm.controls[n-1]["controls"]["rangeEnd"].disable();
        this.disableAdd = false;

        if(this.deleteItm.controls.length == this.editLength)
         this.disableDelete = true;
      } 
    }else if(this.deleteItm.controls.length > 2){
         this.deleteItm.removeAt(this.deleteItm.controls.length - 1);
         let n = this.deleteItm.controls.length;
          let re = this.range;
           this.deleteItm.controls[n-1]["controls"]["rangeEnd"].setValue(re);
            this.deleteItm.controls[n-1]["controls"]["rangeEnd"].disable();
         this.disableAdd = false;

         if(this.deleteItm.controls.length == 2){
          this.disableDelete = true;
        }
    }
    
  }

  addItem() {
    let arr = this.splitItemForm.get('arr') as FormArray;
    console.log(arr.controls.length,arr.controls)
    if(arr.controls.length == 5){
      this.disableAdd = true;
      return;
    }
    let n = arr.controls.length;
    arr.controls[n-1]["controls"]["rangeEnd"].enable();
    arr.controls[n-1]["controls"]["rangeEnd"].setValue('');
    arr.push(this.createItem());
    if(arr.controls.length > 2){
        this.disableDelete = false;
        this.disableAdd = false;
        
      for(let i=0; i < n-1; i++){
          if(arr.controls[i]["controls"]["rangeEnd"].value){
              let re = arr.controls[i]["controls"]["rangeEnd"].value;
          arr.controls[i+1]["controls"]["rangeStart"].setValue(re);
          if(!arr.controls[i]["controls"]["rangeEnd"].value)
          arr.controls[i]["controls"]["rangeEnd"].setValue('');
          arr.controls[i]["controls"]["rangeEnd"].enable();
          }
          if(this.checkItemQty && i < this.editLength-1)    
          arr.controls[i]["controls"]["rangeEnd"].disable();
      }
      let re = this.range;
          arr.controls[n-1]["controls"]["rangeEnd"].setValue(re);
            arr.controls[n-1]["controls"]["rangeEnd"].setValue('');

    }
    if(arr.controls.length == 5){
      this.disableAdd = true;
        return;
    }
  }

  saveSplitItem(modal){
   let split;
   if(this.checkItemQty){
    split = this.splitItemForm.getRawValue();
    for(let i=0; i < split.arr.length; i++){
         if(i <= this.splitRanges.length-1){  
            if(this._gmrDetailsQty > split.arr[i].rangeStart){
              split.arr[i]['showOptions'] = true;
            }else{
              split.arr[i]['showOptions'] = false;
            }
         }else{
          split.arr[i]['showOptions'] = false;
         }
    }
    this.splitAction.emit({"splitData": split});
   }else{
    this.splitAction.emit({"splitData": this.splitItemForm.getRawValue()});
   }
   modal.dismiss('split item close');
  }

  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return  `with: ${reason}`;
    }
  }

  ngOnDestory(){
    this.checktiered$Subscriber.unsubscribe();
    this.checkGmr$Subscriber.unsubscribe();
  }
}
