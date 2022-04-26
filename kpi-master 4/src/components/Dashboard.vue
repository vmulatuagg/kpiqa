<template>
    <div class="container">
        <h4>Vanguard Report</h4>
        <div class="table-container">
            <table class="table table-hover table-striped table-bordered">
                <thead>
                    <tr>
                        <td>Name</td>
                        <td>Start Date</td>
                        <td>Due Date</td>
                        <td>Total Issue</td>

                        <td>To Do</td>
                        <td>Doing</td>
                        <td>Integration</td>
                        <td>Done</td>
                        <td>QA Test</td>
                        <td>QA Reject</td>

                        <td>Opened</td>
                        <td>Closed</td>
                        <td>Techdebt</td>
                        <td>Taken Over</td>
                        <td>Milestone Time</td>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="e of milestones" :key="e.name">
                        <td>{{ e.title }}</td>
                        <td>{{ e.start_date }}</td>
                        <td>{{ e.due_date }}</td>
                        <td>{{ e.data.length }}</td>

                        <td>{{ e.data.filter(i => i.labels.includes("To Do")).length }}</td>
                        <td>{{ e.data.filter(i => i.labels.includes("Doing")).length }}</td>
                        <td>{{ e.data.filter(i => i.labels.includes("Integration")).length }}</td>
                        <td>{{ e.data.filter(i => i.labels.includes("Done")).length }}</td>
                        <td>{{ e.data.filter(i => i.labels.includes("Ready QA Test")).length }}</td>
                        <td>{{ e.data.filter(i => i.labels.includes("QA Reject")).length }}</td>

                        <td>{{ e.data.filter(i => i.state == 'opened').length }}</td>
                        <td>{{ e.data.filter(i => i.state == 'closed').length }}</td>


                        <td>{{ e.data.filter(i => i.labels.includes("Techdebt")).length }}</td>
                        <td>{{ e.data.filter(i => i.labels.includes("Takenover")).length }}</td>
                        <td>{{ getTime(e) }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <span v-if="loading">Sedang Memproses Data, Mohon ditunggu</span>
        <br>
        <span v-if="loading">{{ percent }}%</span>
        <div class="progress">
            <div 
                class="progress-bar progress-bar-striped progress-bar-animated" 
                role="progressbar" 
                aria-valuenow="100" 
                aria-valuemin="0" 
                aria-valuemax="100" 
                :style="{width: percent+'%'}"
            ></div>
        </div>
        <br>
        <button class="btn" v-on:click="initData(true)" v-if="!loading">Refresh Data</button>
    </div>
</template>

<script>
import axios from "axios"
import moment from "moment"
import milestoneJSON from "../data/milestone.json";

const token = "glpat-xzZoy9sobVjoqoaLC1F7"
const baseurl = "https://gitlab.com/api/v4"
const milestoneData = milestoneJSON
export default {
    async mounted(){
		axios.defaults.baseURL = baseurl;
		axios.defaults.headers.common['PRIVATE-TOKEN'] = token;
        this.initData();
	},
    data(){
        return{
            milestones: [],
            project_id: 21304083,
            selected_milestone: null,
            loading: false,
            percent: 0,
        }
    },
    methods:{
        async initData(refresh=false){
            this.loading = true;
            if(refresh){
                localStorage.clear();
                this.milestones = [];
                this.percent = 0;
            }
            let milestoneKey = `milestone|${this.project_id}`
            let milestoneCache = localStorage.getItem(milestoneKey);
            let milestones = [];
            if(milestoneCache){
                milestones = JSON.parse(milestoneCache);
            }
            else{
                let m = await axios.get(`projects/${this.project_id}/milestones`, {});
                milestones = m.data;
                milestones = milestones.sort(this.compare);
                localStorage.setItem(milestoneKey, JSON.stringify(milestones));
            }
            let i = 0;
            for (const mile of milestones) {
                this.percent = i == 0 ? 0 : Math.round((i / milestones.length) * 100);
                let mile_json = milestoneData.find(i => i.id == mile.id);
                mile.data = mile_json ? mile_json.data : await this.getDatas(mile.title);
                i++;
            }
            this.milestones = milestones
            this.loading = false;
            this.percent = 0;
        },
        async getDatas(mile){
			let issues = [];
            let params = {
                order_by: "created_at",
                sort: "asc",
                milestone: mile,
                per_page: 50
            }
            let issueKey = `issue|${this.project_id}|${JSON.stringify(params)}`;
            let issueCache = localStorage.getItem(issueKey);
            if(issueCache){
                issues = JSON.parse(issueCache)
            }
            else{
                let d = await axios.get(`/projects/${this.project_id}/issues`, { params });
                issues = d.data
                localStorage.setItem(issueKey, JSON.stringify(issues));
            }
            return issues;
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
        getTime(d){
            // let days = moment(d.due_date);
            let days = Math.abs(moment(d.start_date).diff(moment(d.due_date), "days")); 
            return days > 10 ? "2 Weeks" : "1 Week";
        }
        // getTechdebt(e){
            // let total = 0;
            // 
        // }
    }
}
</script>
