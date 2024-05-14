import { Component, inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { MenusService } from '../../services/menus.service';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { PdfExportService } from 'src/app/shared/services/pdf-export.service';
import { AddMenusComponent } from './add-menus/add-menus.component';
import { ExportOperation, Operation } from 'src/app/shared/modals';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { offsetLimit } from 'src/app/core/constants/constants';
import { MessagePopupService } from 'src/app/shared/services/popup.service';

@Component({
  selector: 'app-menus',
  templateUrl: './menus.component.html',
  styleUrls: ['./menus.component.less']
})
export class MenusComponent {
  private offCanvasService = inject(NgbOffcanvas);
  screenTitle!: string;
  screenData: any[] = [];
  recordsPaginationLength: any[] = [];
  showStatus: any;
  showEdit: any;
  displayedColumns: any[] = [
    'menuTitle', 'updatedBy'
  ];
  displayTitles: any[] = [
    'Menu Title', 'Updated by', 'Status', 'Edit'
  ];
  displayHeaders: string[] = [
    'Active Menus', 'InActive Menus', 'Total Menus'
  ];
  stats: any;
  //declaring paginator values
  offsetData = offsetLimit.offset;
  limitData = offsetLimit.limit;
  addButtonTitle: string = "Add Menus";
  popUpReference: any;
  menusSearchForm !: FormGroup;
  paginationData: any;
  menusTitle: string = 'Menus';
  //constructor CALL here
  constructor(private menuService: MenusService, private exportExcelService: ExcelExportService,private messageService:MessagePopupService,
    public authService: AuthService, private exportPdfService: PdfExportService, public nonNullableFormBuilder: NonNullableFormBuilder,) {
    this.menusSearchForm = this.nonNullableFormBuilder.group({
      menuTitle: [''],
      isModule: [''],
      isActive: ['']
    });
  }
  //On page  Load Functionalities after constructor
  ngOnInit(): void {
    this.getMenusData();
    this.authService.menuTitle.subscribe((title) => {
      this.screenTitle = title;
    })
  }
  //Pagination Call for Table
  getMenusData() {
    const MenuformData = this.menusSearchForm.value;
    if (this.paginationData) {
      this.offsetData = this.paginationData.data.offset;
      this.limitData = this.paginationData.data.limit;
    }
    const FormControlValues = {
      ...MenuformData,
      offset: this.offsetData,
      limit: this.limitData,
    };
    this.menuService.getMenus(FormControlValues).subscribe((menusDataResponse: any) => {
      this.screenData = menusDataResponse.menuData;
      this.stats = menusDataResponse.stats;
      this.recordsPaginationLength = menusDataResponse.count;
      this.showStatus = true;
      this.showEdit = true;
    });
  }
  //Add menu Pop Up Call using the NgbModal Service
  addMenu() {
    //Opening offCanvas as component
    const OffCanvasReference = this.offCanvasService.open(AddMenusComponent, {
      position: 'end',
      panelClass: 'form-sm',
    });
    const data = {
      data: '',
      fromScreen: this.menusTitle
    }
    OffCanvasReference.componentInstance.menusEditResponseData = data;
    OffCanvasReference.componentInstance.screenTitle = this.screenTitle;
    OffCanvasReference.result.then((data) => {
      if (data) {
        if (data.code == 200) {
          this.messageService.successMessage('Menu details added successfully. ');
          this.getMenusData();
        }
        else if (data.message) {
          this.messageService.erroMessage(data.message);
        }
      }
    });
  }
  //Function will check the emitted operation by common grid component
  checkOperation(operationalData: any) {
    switch (operationalData.operation) {
      case Operation.Add:
        this.addMenu(); //opening the offcanvas
        break;
      case Operation.Edit:
        this.editMenu(operationalData.data.menuId); //opening the offcanvas with particular menu data
        break;
      case Operation.Delete:
        this.statusChange(operationalData.data.menuId); //status change call
        break;
      case Operation.Pagination:
        this.paginationData = operationalData;
        this.getMenusData(); //pagination call depending upon the data
        break;
    }
  }
  //export dropdown
  exportDropdownOperation(exportData: any) {
    switch (exportData.exportOperation) {
      case ExportOperation.Export:
        this.exportMenusData(exportData.data)
        break;
    }
  }
  //Edit menu functionality call here
  editMenu(menuId: any) {
    if (menuId) {
      // Edit call to Bring Edit Data
      this.menuService.editMenu(menuId).subscribe((response: any) => {
        //Opening offCanvas as component *//
        const OffCanvasReference = this.offCanvasService.open(AddMenusComponent, {
          position: 'end',
          panelClass: 'form-sm',
        });
        const data = {
          data: response,
          fromScreen: this.menusTitle
        }
        ///Passing the data to offcanvas ref *///
        OffCanvasReference.componentInstance.menusEditResponseData = data;
        OffCanvasReference.componentInstance.screenTitle = this.screenTitle;
        ///depending upon the result data displaying message *///
        OffCanvasReference.result.then((data) => {
          if (data) {
            if (data.code == 200) {
              this.messageService.successMessage('Menu details updated successfully. ');
              this.getMenusData();
            }
            else if (data.message) {
              this.messageService.erroMessage(data.message);
            }
          }
        });
      });
    }
  }
  //Status Change Functionality
  statusChange(menuId: any) {
     //displaying confirm  message to change status through message component*//
     this.messageService.confirmMessage().subscribe((confirm: boolean) => {
      if (confirm) {
        // service call to change the Change status *////
        this.menuService.changeMenuStatus(menuId, {fromScreen:this.screenTitle}).subscribe((responsedata: any) => {
          if (responsedata.code == 200) {
            //displaying success message *///
            this.messageService.successMessage('Menus status changed successfully.');
            this.getMenusData();
          } else {
            //displaying error message *///
            this.messageService.erroMessage(responsedata.message);
          }
        });
      };
    })
  }
  //search menus functionality
  searchMenusData() {
    const MenuFormValues = this.menusSearchForm.value;
    const IsAnyFieldFilled = Object.values(MenuFormValues).some(
      (value) => value !== '' && value !== null
    );
    if (IsAnyFieldFilled) {
      this.getMenusData();
    }
    //If fields are empty then showing error message
    else {
      this.messageService.informationMessage('Please enter atleast one field.')
    }
  }
  //ecport to el & pdf
  exportMenusData(excel: any) {
    /** getting all data */
    this.menuService.getMenus({ ...this.menusSearchForm.value, IsDataExport: true, DataExportType: excel.dataExportType, FromScreen: this.menusTitle }).subscribe((MenusExportData: any) => {
      let exportData = MenusExportData.vnaBmsExportInformation.exportMenusDetails;
      if (excel.exportType) {
        /** calling export to excel service */
        this.exportExcelService.exportAsExcel({
          data: exportData,
          fileName: this.menusTitle,
        });
      } else {
        /** calling export to pdf service */
        this.exportPdfService.exportAsPdf({
          data: exportData,
          fileName: this.menusTitle,
        });
      }
    });
  }
  //clearing the search input form fields and reloading the data
  clearMenuForm() {
    this.menusSearchForm.reset();
    this.getMenusData();
  }
}
