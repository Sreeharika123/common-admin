import { Component, inject } from '@angular/core';
import { FormGroup, NonNullableFormBuilder } from '@angular/forms';
import { NgbModal, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { offsetLimit } from 'src/app/core/constants/constants';
import { AuthService } from 'src/app/modules/auth/services/auth.service';
import { ExportOperation, Operation } from 'src/app/shared/modals';
import { DropdownService } from 'src/app/shared/services/dropdown.service';
import { ExcelExportService } from 'src/app/shared/services/excel-export.service';
import { PdfExportService } from 'src/app/shared/services/pdf-export.service';
import { MessagePopupService } from 'src/app/shared/services/popup.service';
import { UsersService } from '../../services/users.service';
import { AddUsersComponent } from './add-users/add-users.component';
import { MessageComponent } from 'src/app/shared/components/message/message.component';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.less']
})
export class UsersComponent {
  private modalService = inject(NgbModal);
  private offCanvasService = inject(NgbOffcanvas);
  screenTitle!: string;
  clearButtonTitle: string = "Clear";
  searchButtonTitle: string = "Search";
  isActiveList = [
    { isActiveId: "", isActive: "--Status--" },
    { isActiveId: "1", isActive: "Active" },
    { isActiveId: "0", isActive: "InActive" }
  ];
  roleList: any[] = [];
  userTypeList: any[] = [];
  subContractorTypeList: any[] = [];
  userInformationSearch!: FormGroup;
  paginationData: any;
  statsData: any;
  offSetValue!: number;
  screenData: any[] = [];
  dataSource: any[] = [];
  showStatus: any;
  showEdit: any;
  titleSubscription: any;
  userTitle: string = 'Users';
  recordsPaginationLength: any[] = [];
  displayedColumns: any[] = [
    'emailAddress', 'surname', 'firstName', 'roleName', 'updatedBy'
  ];
  displayTitles: any[] = [
    'Email Address', 'Surname', 'First Name', 'Role', 'Updated by', 'Status', 'Edit'
  ];
  displayHeaders: string[] = [
    'Active Users', 'InActive Users', 'Total Users'
  ];
  offsetData = offsetLimit.offset;
  limitData = offsetLimit.limit;
  constructor(
    private nonNullableFormBuilder: NonNullableFormBuilder,
    private service: UsersService,
    private dropDownService: DropdownService,
    private exportExcelService: ExcelExportService,
    private exportPdfService: PdfExportService,
    public authService: AuthService,
    public messagePopupService: MessagePopupService
  ) {
    this.userInformationSearch = this.nonNullableFormBuilder.group({
      roleId: [''],
      emailAddress: [''],
      isActive: ['']
    })
    //binding dropDowns
    this.dropDownService.getDropDowns('roles,subcontractorname,usertypes').subscribe((data: any) => {
      this.roleList = data.dataSetCollection.roles;
      this.userTypeList = data.dataSetCollection.usertypes;
      this.subContractorTypeList = data.dataSetCollection.subcontractorname;
    });
  }
  ///On page  Load Functionalities after constructor*///
  ngOnInit(): void {
    this.girdLoad();
    this.titleSubscription = this.authService.menuTitle.subscribe((title) => {
      this.screenTitle = title;
    });
  }
  ////Pagination Call for Table*///
  girdLoad() {
    if (this.paginationData) {
      this.offsetData = this.paginationData.data.offset;
      this.limitData = this.paginationData.data.limit;
    }
    let searchInormationAndPagination = {
      ...this.userInformationSearch.value,
      offSet: this.offsetData,
      limit: this.limitData
    };
    this.service.getUsersService(searchInormationAndPagination).subscribe((response: any) => {
      this.screenData = response.usersData;
      this.statsData = response.statsData;
      this.recordsPaginationLength = response.statsData.total;
      this.showStatus = true;
      this.showEdit = true;
    });
  }
  /** function for add the user */
  addUser() {
    //* Opening offCanvas as component *//
    const OffCanvasReference = this.offCanvasService.open(AddUsersComponent, { position: 'end', panelClass: 'form-sm' });
    OffCanvasReference.componentInstance.userData = { roleList: this.roleList, userTypeList: this.userTypeList, subContractorTypeList: this.subContractorTypeList };
    OffCanvasReference.componentInstance.screenTitle = this.screenTitle;
    OffCanvasReference.result.then((data) => { data ? this.girdLoad() : null });
  };
  /** function for edit the user */
  editUser(userData: any) {
    this.service.editUserService(userData.userID).subscribe((response) => {
      const OffCanvasReference = this.offCanvasService.open(AddUsersComponent, { position: 'end', panelClass: 'form-sm' });
      OffCanvasReference.componentInstance.userData = { roleList: this.roleList, userTypeList: this.userTypeList, subContractorTypeList: this.subContractorTypeList, editUserInformation: response, userInformation: userData };
      OffCanvasReference.componentInstance.screenTitle = this.screenTitle;
      OffCanvasReference.result.then((data) => { data ? this.girdLoad() : null });
    });
  }
  /** function for change the user status */
  userStatusChange(userData: any) {
    const PopupReference = this.modalService.open(MessageComponent);
    PopupReference.componentInstance.data = { message: `Do you want to change the "${userData.surname} ${userData.firstName}" status?`, type: 'confirm' };
    PopupReference.closed.subscribe((response: boolean) => {
      if (response) {
        this.service.userStatuschangeService(userData.userID, {fromScreen:this.userTitle}).subscribe((response: any) => {
          if (response.code == 200) {
            this.messagePopupService.successMessage(`${userData.surname} ${userData.firstName} status changed successfully.`);
            this.girdLoad();
          } else {
            this.messagePopupService.erroMessage(response.message);
          }
        });
      }
    });
  };
  /** function for search the user */
  searchUserData() {
    const UserformValues = this.userInformationSearch.value;
    const isAnyFieldFilled = Object.values(UserformValues).some(
      (value) => value !== '' && value !== null
    );
    if (isAnyFieldFilled) {
      this.girdLoad();
    }
    /** If the search field value empty then showing error message */
    else {
      this.messagePopupService.informationMessage('Atleast one field value is required to search users.')
    }
  };
  /** function for reset the screen */
  clearUserData() {
    this.userInformationSearch.reset();
    this.girdLoad();
  };
  //Function will check the emitted operation by common grid component
  checkOperation(userData: any) {
    switch (userData.operation) {
      case Operation.Edit:
        this.editUser(userData.data);
        break;
      case Operation.Delete:
        this.userStatusChange(userData.data);
        break;
      case Operation.Pagination:
        this.paginationData = userData
        this.girdLoad();
        break;
    }
  }
  //export to excel or pdf
  exportDropDownOperation(exportData: any) {
    switch (exportData.exportOperation) {
      case ExportOperation.Export:
        this.exportUsersData(exportData.data)
        break;
    }
  }
  exportUsersData(excel: any) {
    this.service.getUsersService({ ...this.userInformationSearch.value, IsDataExport: true, DataExportType: excel.dataExportType, FromScreen: this.userTitle }).subscribe((UsersExportData: any) => {
      let exportData = UsersExportData.vnaBmsExportInformation.exportUsersDetails;
      if (excel.exportType) {
        /** calling export to excel service */
        this.exportExcelService.exportAsExcel({
          data: exportData,
          fileName: this.userTitle,
        });
      } else {
        /** calling export to pdf service */
        this.exportPdfService.exportAsPdf({
          data: exportData,
          fileName: this.userTitle,
        });
      }
    });

  }
  ngOnDestroy(): void {
    this.titleSubscription.unsubscribe();
  }
  //function for validating to form controles
  showError(formControlName: string) {
    const control = this.userInformationSearch.get(formControlName);
    return !!control && control.invalid && (control.errors?.['required'] && control.touched);
  }
}
