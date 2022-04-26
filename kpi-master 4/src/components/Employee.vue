<template>
    <div class="container">
        <h4>Vanguard Team Details</h4>
        <span>( During all milestones )</span>
        <br/>
        <br/>
        <div class="table-container">
            <table class="table table-hover table-striped table-bordered">
                <thead>
                    <tr>
                        <td>Name</td>
                        <td>Role</td>
                        <!-- <td>Gitlab ID</td> -->
                        <td>Total Issue</td>
                        <td>Open</td>
                        <td>Close</td>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="e of statistics" :key="e.name">
                        <td>{{ e.name }}</td>
                        <td>{{ e.role }}</td>
                        <!-- <td>{{ e.assignee_id }}</td> -->
                        <td>{{ e.all }}</td>
                        <td>{{ e.opened }}</td>
                        <td>{{ e.closed }}</td>
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
        <button v-if="!loading" v-on:click="getStats(true)" class="btn">Refresh Data</button>
    </div>
</template>

<script>
import employeeData from "../data/employee.json";
import axios from "axios"

const employee = employeeData;
const token = "glpat-cvppuvi75js6C_wEXZAn"
const baseurl = "https://gitlab.com/api/v4"
export default {
    data(){
        return {
            employee: employee,
            issues: [],
            project_id: 21304083,
            statistics: [],
            loading: false,
            percent: 0,
        }
    },
    async mounted(){
        axios.defaults.baseURL = baseurl;
		axios.defaults.headers.common['PRIVATE-TOKEN'] = token;
        this.getStats()
    },
    methods:{
        async getStats(refresh = false){
            let teamKey = `teamdata`
            let teamCache = localStorage.getItem(teamKey);
            if(teamCache && refresh == false){
                this.statistics = JSON.parse(teamCache);
            }
            else{
                this.statistics = [];
                this.loading = true;
                let s = []
                let i = 0;
                for (const e of this.employee) {
                    this.percent = i == 0 ? 0 : Math.round((i / this.employee.length) * 100);
                    let issue = await axios.get(`projects/${this.project_id}/issues_statistics?assignee_id=${e.assignee_id}`, {} )
                    s.push({
                        name: e.name,
                        role: e.role,
                        assignee_id: e.assignee_id,
                        all: issue.data.statistics.counts.all,
                        opened: issue.data.statistics.counts.opened,
                        closed: issue.data.statistics.counts.closed,
                    });
                    i++;
                }
                this.statistics = s;
                localStorage.setItem(teamKey, JSON.stringify(s));
                this.loading = false;
                this.percent = 0;
            }
        }
    }
}
</script>