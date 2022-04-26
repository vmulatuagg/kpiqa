<template>
    <div>
        <div class="container" v-if="current_milestone && current_milestone.data && current_milestone.data">
            <!-- <h4>Vanguard Report</h4> -->
            <div class="card">
                <div class="card-item">
                    <label>Total Milestone</label>
                    <span>{{ milestones.length }} Milestones</span>
                </div>
                <div class="card-item">
                    <label>Current Milestone</label>
                    <span>{{ current_milestone.title }}</span>
                </div>
                <div class="card-item">
                    <label>Total Issue Current Milestone</label>
                    <span>{{ current_milestone.data.length }} issues</span>
                </div>
                <div class="card-item">
                    <label>Current Milestone Due Date</label>
                    <span>{{ current_milestone.due_date }}</span>
                </div>
            </div>
            <div class="progression">
                <div class="progression-item">
                    <label class="title">Total Issue</label>
                    <label class="subtitle">{{ current_milestone.data.length }}</label>
                    <div class="bar"></div>
                </div>
                <div class="progression-item" v-for="l of labels" :key="l.id">
                    <label class="title" v-if="l.data && l.data.length > 0">{{ l.name }} ({{ l.data.length }})</label>
                    <label class="title" v-else>{{ l.name }} (0)</label>
                    <div class="bar" v-if="l.data">
                        <div class="bar-item" :style="{ width : `${getProgress(l)}%`, background: l.color, color: l.text_color }">
                            <label v-if="getProgress(l) > 1"> {{ getProgress(l)+"%" }} </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="container" v-else>
            <h4>Sedang tidak ada milestone yang aktif</h4>
        </div>
    </div>
</template>

<script>
import axios from "axios"
import moment from "moment"
import milestoneJSON from "../data/milestone.json";
import labelJSON from "../data/labels.json";
// import firebase from 'firebase/app'

const token = "glpat-cvppuvi75js6C_wEXZAn"
const baseurl = "https://gitlab.com/api/v4"
const milestoneData = milestoneJSON
// const firestoreProjectId = "super-app-10074"

export default {
    async mounted(){
        console.log(this.current_milestone.data);
        axios.defaults.baseURL = baseurl;
		axios.defaults.headers.common['PRIVATE-TOKEN'] = token;
        this.initData();
        // const db = firebase
        //   .initializeApp({ projectId: firestoreProjectId })
        //   .firestore();
        // console.log(db);
	},
    data(){
        return{
            milestones: [],
            project_id: 21304083,
            group_id: 9029744,
            loading: false,
            percent: 0,
            current_milestone: {
                title : "No Milestone",
                data: null,
                due_date: ""
            },
            labels: null,
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
            // let milestoneKey = `milestone|${this.project_id}`
            // let milestoneCache = localStorage.getItem(milestoneKey);
            let milestones = [];
            // if(milestoneCache){
            //     milestones = JSON.parse(milestoneCache);
            // }
            // else{
                let m = await axios.get(`projects/${this.project_id}/milestones`, {});
                milestones = m.data;
                milestones = milestones.sort(this.compare);

                let label = await axios.get(`projects/${this.project_id}/labels`, { per_page: 50 });
                label = label.data;
                let group_label = await axios.get(`groups/${this.group_id}/labels`, { per_page: 50 });
                group_label = group_label.data;
                await group_label.map(i => label.push(i));
                this.labels = label.filter( i => labelJSON.includes(i.name));
                // this.labels = labelJSON.map( i => i.data = label.data.find( j => j.name == i));
                // localStorage.setItem(milestoneKey, JSON.stringify(milestones));
            // }
            let i = 0;
            for (const mile of milestones.filter(i => i.expired == false)) {
                this.percent = i == 0 ? 0 : Math.round((i / milestones.length) * 100);
                let mile_json = milestoneData.find(i => i.id == mile.id);
                mile.data = mile_json ? mile_json.data : await this.getDatas(mile.title);
                i++;
            }
            let current_milestone = milestones.filter(i => i.expired == false)
            this.current_milestone = current_milestone.length > 0 ? current_milestone[0] : this.current_milestone
            this.milestones = milestones
            console.log(this.current_milestone.data);
            if(this.current_milestone.data.length > 0){
                this.loading = false;
                this.labels.map( l => {
                    l.data = this.current_milestone.data.filter(i => i.labels.includes(l.name));
                });
            }
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
            // let issueCache = localStorage.getItem(issueKey);
            let issueCache = false
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
        },
        getProgress(l){
            if(l.data){
                let p = Math.ceil( (l.data.length / this.current_milestone.data.length) * 100 );
                console.log(l, p);
                return p > 0 ? p : 1;
            }
            else return 0;
        }
        // getTechdebt(e){
            // let total = 0;
            // 
        // }
    }
}
</script>

<style lang="sass" scoped>
    @import "../assets/styles/global.scss"
    .progression
        margin: 60px 0px
        display: flex
        width: 100%
        flex-direction: column
        font-size: 16px
        // background: #dadade
        padding: 20px
        border-radius: 10px
        box-shadow: 0px 0px 10px 3px #dadade
        .progression-item
            display: flex
            align-items: center
            height: 50px
            margin-top: 4px
            .title
                width: 30%
            .bar
                width: 70% 
                .bar-item
                    display: flex
                    flex-direction: column
                    justify-content: center
                    align-items: start
                    padding-left: 4px
                    height: 50px
                    border-radius: 10px
    .card
        color: #6f6f6f
        width: 100%
        display: flex
        flex-direction: row
        justify-content: space-around
        box-shadow: none !important
        border: none !important
        .card-item
            display: flex
            flex-direction: column
            height: 100px
            justify-content: space-around
            background: #fff
            width: 20%
            border-radius: 10px
            align-items: center
            // border: 3px solid #6f6f6f
            background: #f7f7f7
            white-space: nowrap
            overflow: hidden
            text-overflow: ellipsis
            label
                display: block
                font-size: 12px
                // color: #406ae1
                text-decoration: underline
            span
                font-size: 18px
                font-weight: bold
                color: $secondary 
    @media (max-width: 767.98px)
        .card
            display: flex
            flex-direction: column !important
            margin: 0 auto
            position: relative
            width: 80vw !important
            margin: 0 auto
            .card-item
                width: 100% !important
                margin-bottom: 20px
    @media only screen and (min-device-width: 780px)
        .card
            color: #6f6f6f
            width: 100%
            display: flex
            flex-direction: row
            justify-content: space-around
            box-shadow: none !important
            border: none !important
            margin-top: 10px
            .card-item
                display: flex
                flex-direction: column
                height: 100px
                justify-content: space-around
                width: 20%
                border-radius: 10px
                align-items: center
                background: #fff
                white-space: nowrap
                overflow: hidden
                text-overflow: ellipsis
                box-shadow: 0px 0px 10px 3px #dadade
                label
                    display: block
                    font-size: 12px
                    // color: #406ae1
                    text-decoration: underline
                span
                    font-size: 18px
                    font-weight: bold
                    color: $secondary 
</style>