import {Component, OnInit, HostListener, Inject} from '@angular/core';
import {FormGroup, FormBuilder, Validators} from "@angular/forms";
import {Category} from "../models/category";
import {NmcService} from "../services/nmc_service";
import {Router} from "@angular/router";
import {MdSnackBar} from "@angular/material";
import {CrmService} from "../services/crm.service";
import {error} from "util";
import {Lead} from "../models/lead";
import {DOCUMENT} from "@angular/platform-browser";

@Component({
  selector: 'aio-search-lead',
  templateUrl: './search-lead.component.html'
})
export class SearchLeadComponent implements OnInit {

  loading: boolean
  searchLeadForm: FormGroup;
  rootCategories: Category[] = []
  categories: Category[] = []
  businessCategories: Category[] = []

  pageIndex: number = 1

  customerCategories: string[]

  leads: Lead[] = []


  constructor(private formBuilder: FormBuilder, private ds: NmcService, private cs: CrmService, private router: Router, @Inject(DOCUMENT) private document: Document) {
    //this.user = JSON.parse(localStorage.getItem('currentUser'))
    this.searchLeadForm = formBuilder.group({
      'rootCategories': [''],
      'categories': [''],
      'textSearch': ['']
    });

  }

  ngOnInit() {
    this.loading = true
    this.customerCategories = []

    this.ds.categories().subscribe(
      data => {
        data.map(category => {
          if (category.level == "1") {
            this.rootCategories.push(category)
          } else {
            this.categories.push(category)
          }
        })
        this.rootCategories.push(new Category())

        this.loading = false
      },
      error => {
        this.ds.showGeneralError(error)
        this.loading = false
      }
    )

    // this.doSearch()

  }

  onClick(categoryId) {
    let index = this.customerCategories.indexOf(categoryId)
    if (index > -1) {
      this.customerCategories.splice(index, 1)
    } else {
      this.customerCategories.push(categoryId)
    }
  }

  changeCompanyType(value: any) {
    this.businessCategories = []
    this.categories.filter(category => {
      if (category.parentId === value)
        this.businessCategories.push(category)
    })
    this.categories.push(new Category())
  }

  doSearch() {
    //console.log("searching")
    this.loading = true
    this.cs.searchLeads(
      this.searchLeadForm.controls['rootCategories'].value,
      this.searchLeadForm.controls['categories'].value,
      this.searchLeadForm.controls['textSearch'].value,
      this.pageIndex.toString()
    ).subscribe(
      data => {
        this.loading = false
        data.forEach(lead => this.leads.push(lead))
        // console.log(data)
      },
      error => {
        this.loading = false
        this.cs.showCrmError(error)
      }
    )
  }


  onSearch() {
    this.leads = []
    this.doSearch()
  }

  onLazySearch(event: any) {
    console.log(event)
    this.pageIndex = this.pageIndex + 1
   // this.doSearch()
  }

  onSubmit() {
    // this.customerCategories.forEach( cat => this.user[CATEGORY_USER].push({"114.93": NmcService.pad(cat)}))
    // this.user[RETURN_POLICY] = NmcService.toHex(this.detailForm.controls['returnPolicy'].value)
    // localStorage.setItem("currentUser", JSON.stringify(this.user))
    // this.router.navigate(["/purchasing"])
  }

  goNewLead() {
    this.router.navigate(["/editLead", "New"])
  }

  onSelectLead(value: any) {
    this.router.navigate(["/editLead", value, "View"])
  }

  onEditLead(value: any) {
    this.router.navigate(["/editLead", value, "Edit"])
  }

  onViewNotes(value: any) {
    this.router.navigate(["/notes", value])
  }

  @HostListener("window:scroll", [])
  onWindowScroll() {
    //we'll do some stuff here when the window is scrolled
    console.log(this.document.body.scrollTop)
  }

}
