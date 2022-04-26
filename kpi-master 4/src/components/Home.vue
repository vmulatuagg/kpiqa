<template>
    <div>
    <!-- <Layout/> -->
    <div class="container">
        <div class="header">
            <h4>{{ selected_milestone }} ({{ issues.length }} issues)</h4>
            <div class="filter">
                <label class="labelling">Pilih Milestones : </label>
                <select @change="changeMilestone($event)">
                    <option value="0">---</option>
                    <option v-for="s of milestones" :key="s.id" :value="s.title" > {{ s.title }} </option>
                </select>
                <label class="labelling">Filter Developer : </label>
                <select @change="filterEmployee($event)">
                    <option value="0">---</option>
                    <option v-for="s of employee" :key="s.id" :value="s.assignee_id" > {{ s.name + ` (${s.role})` }} </option>
                </select>
            </div>
        </div>
        <!-- <div v-for="b of board_list" :key="b"> -->
            <!-- <br> -->
            <!-- <h6>{{ b }} ( {{ getIssues(b).length }} Issues )</h6> -->
            <div class="table-container">
                <table class="table table-hover  table-bordered">
                    <thead>
                        <tr>
                            <td>No.</td>
                            <td>Title</td>
                            <td>Assignee</td>
                            <td>W</td>
                        </tr>
                    </thead>
                    <tbody v-for="b of board_list" :key="b">
                        <tr>
                            <td colspan="4">
                                {{ b }} ( {{ getIssues(b).length }} Issues )
                            </td>
                        </tr>
                        <tr v-for="e of getIssues(b)" :key="e.id">
                            <td><a :href="e.web_url" target="blank" class="decoration-none">{{ e.iid }}</a></td>
                            <td>{{ e.title }}</td>
                            <td style="text-transform: capitalize">{{ getName(e.assignee) }}</td>
                            <td>
                                <span v-for="l of e.labels" :key="l"> {{ getWeight(l) }}</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        <!-- </div> -->
        <br><br>
        <h4>Key Performance Indicator</h4>
        <div class="table-container">
            <table class="table-bordered table-hover kpi table">
                <thead>
                    <tr>
                        <td>Name</td>
                        <td>Role</td>
                        <td>Total Issue</td>
                        <td>Total Weight</td>
                        <td>Desired Weight</td>
                        <td>Weight Diff</td>
                        <td>QA Reject</td>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="e of employee" :key="e.name">
                        <td>{{ e.name }}</td>
                        <td>{{ e.role }}</td>
                        <td>{{ e.total_issue }}</td>
                        <td>{{ e.total_weight }}</td>
                        <td>{{ e.desired_weight }}</td>
                        <td class="success" v-if="e.diff <= 0">{{ Math.abs(e.diff) }}</td>
                        <td class="danger" v-else>{{ Math.abs(e.diff) }}</td>
                        <td>{{ e.qa_reject }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
    </div>
</template>

<script>
import axios from "axios"
import employeeData from "../data/employee.json";
import sprintData from "../data/sprint.json";
import weightData from "../data/standard.json";
import moment from "moment";
import milestoneJSON from "../data/milestone.json";
// import Layout from "./Layout.vue";


const token = "glpat-xzZoy9sobVjoqoaLC1F7"
const baseurl = "https://gitlab.com/api/v4"
const employee = employeeData;
const sprint = sprintData;
const weight = weightData;
const milestoneData = milestoneJSON
export default {
    // components: { Layout },
	data(){
		return{
			issues : [],
			sprint: sprint,
			employee: employee,
			kpi: [],
			milestones: [],
			project_id: 35500163,
			selected_milestone: null,
            loading: false,
            percent: 0,
            selected_employee: null,
            qa_reject : [],
            board: [],
            board_list: [
                "Backlog",
                "To Do",
                "Doing",
                "Integration",
                "Ready QA Test",
                "Done",
                "QA Reject"
            ],
		}
	},
	async mounted(){
		axios.defaults.baseURL = baseurl;
		axios.defaults.headers.common['PRIVATE-TOKEN'] = token;
        let milestoneKey = `milestone|${this.project_id}`
        let milestoneCache = localStorage.getItem(milestoneKey);
        if(milestoneCache){
            this.milestones = JSON.parse(milestoneCache);
        }
        else{
            let m = await axios.get(`projects/${this.project_id}/milestones`, {});
            this.milestones = m.data;
            this.milestones = this.milestones.sort(this.compare);
            localStorage.setItem(milestoneKey, JSON.stringify(this.milestones));
        }
        this.getDatas();
	},
	methods: {
		getWeight(w){
			if(!isNaN(w)) return w
		},
		getName(n){
			return n ? n.name : n    
		},
		getStats(l){
			let label = [];
			for (const item of l) {
				if(isNaN(item) && item != 'Takenover' && item != 'Techdebt') label.push(item)
			}
			return label.join(", ")
		},
        getTakenOver(l){
            let to = false
			for (const item of l) {
				if(item == 'Takenover') to = true;
			}
			return to;
        },
        getTechDebt(l){
            let to = false
			for (const item of l) {
				if(item == 'Techdebt') to = true;
			}
			return to;
        },
		changeMilestone(e){
			this.selected_milestone = e.target.value == 0 ? null : e.target.value;
			this.getDatas();
		},
        filterEmployee(e){
			this.selected_employee = e.target.value == 0 ? null : e.target.value;
			this.getDatas();
		},
        compare( a, b ) {
            if ( new Date(a.start_date) < new Date(b.start_date) ){
                return -1;
            }
            if ( new Date(a.start_date) > new Date(b.start_date) ){
                return 1;
            }
            return 0;
        },
        getDate(d){
            return new moment(d).format("Y-MM-DD")
        },
        async getQAReject(e){
            let { assignee_id } = e;
            let t = 0;
            this.issues.filter(i => {
                    return i && i.assignee && i.assignee.id == assignee_id
                }).filter( i => {
                    return i.label_events.filter( j => j.label.id == 23214146 && j.action == "add" );
            })
            return t;
        },
// objs.sort( compare );
		async getDatas(refresh=false){
            console.log(refresh);
			this.issues = [];
            this.employee = [];
            this.loading = true;
            if(this.selected_milestone == null){
                this.selected_milestone = this.milestones[this.milestones.length - 1].title;
            }
			if(this.selected_milestone != null){
				let params = {
					order_by: "created_at",
					sort: "asc",
					milestone: this.selected_milestone,
					per_page: 50
				}
                let mile_json = milestoneData.find(i => i.title == this.selected_milestone);
                if(mile_json){
                    this.issues = mile_json.data;
                }
                else{
                    let d = await axios.get(`/projects/${this.project_id}/issues`, { params });
                    this.issues = d.data
                    let counter = 0;
                    for (const i of this.issues) {
                        this.percent = i == 0 ? 0 : Math.round((counter / this.issues.length) * 100);
                        counter++;
                    }
                }
                if(this.selected_employee){
                    this.issues = this.issues.filter(i => i.assignee && i.assignee.id == this.selected_employee);
                }
                let m = this.milestones.find(i => i.title == this.selected_milestone);
                let days = Math.abs(moment(m.start_date).diff(moment(m.due_date), 'days')) > 10 ? 10 : 5;
                let s_weight = weight
                s_weight = weight.find( i => i.days == days).weight;
                this.employee = employee
				this.employee.map( i => {
					let t = this.issues.filter(issue => {
                        return issue && issue.assignee && issue.assignee.id == i.assignee_id
                    });
					i.total_issue = t.length; 
                    let qa = 0;
                    t.map( i => {
                        if(i && i.label_events){
                            i.label_events.map(j => {
                                if(j.label.id == 23214146 && j.action == "add") qa++;
                            })
                        }
                    });

                    i.qa_reject = qa;
                    let sw = s_weight.find(w => w.position == i.role);
                    i.desired_weight = sw ? sw.weight : 0;
					let tw = 0;
					for (const item of t) {
						for (const label of item.labels) {
							tw+= isNaN(Number(label)) ? 0 : Number(label)
						}            
					}
					i.total_weight = tw; 
                    i.diff = i.desired_weight - i.total_weight
				});
			}
            this.loading = false;
            this.percent = 0;
		},
        getIssues(board){
            return this.issues.filter(i => i.labels.includes(board));
        }
	}
}

</script>

<style lang="sass" scoped>
.header
    display: flex
    justify-content: space-between
    align-items: center
    width: 96%
    .filter
        display: flex
        align-items: center
        justify-content: end
        label.labelling
            margin: 10px !important
        select
            width: 10vw
            border-radius: 4px
</style>
