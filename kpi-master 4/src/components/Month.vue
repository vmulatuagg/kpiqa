<template>
    <div class="container">
		<label>Pilih Bulan : </label>
        <select @change="changeMilestone($event)" class="form-control">
			<option value="0">---</option>
            <option v-for="s of months" :key="s" :value="s" > {{ s }} </option>
        </select>
		<hr>
        <!-- <select>
            <option v-for="e of employee" :key="e.name"> {{ e.name }} </option>
        </select> -->
        <h4>{{ selected_month }}</h4>
        <p>Total Issue : {{ issues.length }}</p>
        <div v-for="b of board_list" :key="b">
            <br><br>
            <h4>{{ b }}</h4>
            <h6>Total {{ getIssues(b).length }} Issue</h6>
            <div class="table-container" v-if="getIssues(b).length > 0">
                <table class="table table-hover table-striped table-bordered">
                    <thead>
                        <tr>
                            <td>No.</td>
                            <td>Title</td>
                            <td>Assignee</td>
                            <td>W</td>
                            <!-- <td>Status Logs</td> -->
                            <td>Open / Close</td>
                            <td>Closed By</td>
                            <!-- <td>Taken Over</td> -->
                            <!-- <td>Technical Debt</td> -->
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="e of getIssues(b)" :key="e.id">
                            <td><a :href="e.web_url" target="blank" class="decoration-none">{{ e.iid }}</a></td>
                            <td>{{ e.title }}</td>
                            <td style="text-transform: capitalize">{{ getName(e.assignee) }}</td>
                            <td>
                                <span v-for="l of e.labels" :key="l"> {{ getWeight(l) }}</span>
                            </td>
                            <!-- <td>
                                <span> {{ getStats(e.labels) }}</span>
                            </td> -->
                            <!-- <td v-if="e.label_events && e.label_events.length > 0">
                                <span v-for="l of e.label_events" :key="l.id" class="log-item">
                                    {{ getDate(l.created_at) }} - {{ l.user.name.split(" ")[0] }} {{ l.action }} &nbsp;
                                    <span :style="{ 
                                        background: l.label.color, 
                                        'border-radius': '4px',
                                        color: l.label.text_color,
                                    }" class="log-stats">{{ l.label.name }}</span>
                                    <br>
                                </span>
                            </td> -->
                            <!-- <td v-else>&nbsp;</td> -->
                            <td v-if="e.state == 'closed'" class="closed">
                                <span> {{ e.state }}</span>
                            </td>
                            <td v-else>
                                <span> {{ e.state }}</span>
                            </td>
                            <td>
                                <span> {{ e.closed_by && e.closed_by.name}} </span>
                            </td>
                            <!-- <td :class="{ 'takenover' : getTakenOver(e.labels) }">
                                <span v-if="getTakenOver(e.labels)"> Taken Over </span>
                            </td>
                            <td :class="{ 'takenover' : getTakenOver(e.labels) }">
                                <span v-if="getTechDebt(e.labels)"> Tech Debt </span>
                            </td> -->
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        <hr>
        <hr>
        <h4>Key Performance Indicator</h4>
        <table class="table table-hover table-striped table-bordered kpi" v-if="employee_loaded">
            <thead>
                <tr>
                    <td>Name</td>
                    <td>Role</td>
                    <td>Total Issue</td>
                    <td>Total Weight</td>
                    <td>Desired Weight</td>
                    <td>Weight Diff</td>
                    <!-- <td>Completion</td>
                    <td>Capacity</td>
                    <td>Defect Removal</td>
                    <td>QA Rejected</td>
                    <td>Release</td>
                    <td>Proactive</td>
                    <td>Work & Learn</td>
                    <td>Total</td> -->
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
                    <!-- <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td>
                    <td>0</td> -->
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script>
import axios from "axios"
import employeeData from "../data/employee.json";
import sprintData from "../data/sprint.json";
import milestoneJSON from "../data/milestone.json";
import weightData from "../data/standard.json";
import moment from "moment";

const token = "glpat-cvppuvi75js6C_wEXZAn"
const baseurl = "https://gitlab.com/api/v4"
const sprint = sprintData;
const milestoneData = milestoneJSON
export default {
	data(){
		return{
			issues : [],
			sprint: sprint,
			employee: employeeData,
			kpi: [],
			milestones: [],
			project_id: 21304083,
			selected_milestone: null,
            months: ["JUL", "AUG", "SEPT", "NOV", "DEC", "JAN", "FEB", "MAR"],
            selected_month : null,
            board: [],
            weight : null,
            board_list: [
                "Backlog",
                "To Do",
                "Doing",
                "Integration",
                "Ready QA Test",
                "Done",
                "QA Reject"
            ],
            interval: null,
            employee_loaded: false,
		}
	},
	async mounted(){
		axios.defaults.baseURL = baseurl;
		axios.defaults.headers.common['PRIVATE-TOKEN'] = token;
        let m = await axios.get(`projects/${this.project_id}/milestones`, {});
        this.milestones = m.data;
        this.milestones = this.milestones.sort(this.compare);
        this.weight = JSON.parse(JSON.stringify(weightData));

        await this.getDatas();
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
			this.selected_month = e.target.value == 0 ? null : e.target.value;
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
// objs.sort( compare );
		async getDatas(){
            this.employee_loaded = false;
			this.issues = [];
            this.employee = [];
            this.selected_month = this.selected_month != null ? this.selected_month : this.months[this.months.length - 1];
            this.selected_milestone = this.milestones.filter(i => i.title.includes(this.selected_month));
            await this.selected_milestone.map(async mile => {
                let params = {
                    order_by: "created_at",
                    sort: "asc",
                    milestone: mile.title,
                    per_page: 50
                }
                let mile_json = milestoneData.find(i => i.title == mile.title);
                if(mile_json){
                    await mile_json.data.map( async i => await this.issues.push(i));
                }
                else{
                    let d = await axios.get(`/projects/${this.project_id}/issues`, { params });
                    await d.data.map( async i => await this.issues.push(i));
                }
            });
            let weights = [];
            let s_weight = [];
            await this.selected_milestone.map(async nm => {
                let days = Math.abs(moment(nm.start_date).diff(moment(nm.due_date), 'days')) > 10 ? 10 : 5;
                s_weight = JSON.parse(JSON.stringify(this.weight.find( i => i.days == days).weight));
                await s_weight.map(sw => {
                    let wexists = weights.find(w => w.position == sw.position);
                    if(wexists){
                        wexists.weight += sw.weight
                    }
                    else{
                        weights.push(sw);
                    }
                })
            })
            this.employee = employeeData;
            let issue_len = 0;
            let i = 0;
            this.interval = setInterval(async () => {
                i++;
                // console.log("interval", this.issues.length, i);
                if(this.issues.length > 0){
                    await this.readEmployeeData(weights);
                    if(this.issues.length == issue_len) clearInterval(this.interval)
                    issue_len = this.issues.length;
                    this.employee_loaded = true;
                }
                else{
                    if(i == 5) clearInterval(this.interval)
                    // console.log("masuk else");
                }
            }, 1000);
		},
        async readEmployeeData(weights){
            await this.employee.map(async i => {
                let t = await this.issues.filter(issue => issue.assignee.id == i.assignee_id);
                i.total_issue = t.length; 
                let sw = weights.find(w => w.position == i.role);
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
        },
        getIssues(board){
            return this.issues.filter(i => i.labels.includes(board));
        }
	}
}

</script>