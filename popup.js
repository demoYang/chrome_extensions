class ComicAutoCostCoupon {

	//步长 (每次执行命令消耗 漫读券的个数 )
	static COMIC_COUPON_SETP = 1;

	
	//获取漫画详情url
	static COMIC_DETAIL_URL = "https://manga.bilibili.com/twirp/comic.v2.Comic/ComicDetail?device=pc&platform=web";

	//获取推荐漫读券url
	static COMIC_GET_RECOMMOND_ID = "https://manga.bilibili.com/twirp/comic.v1.Comic/GetEpisodeBuyInfo?device=pc&platform=web";

	//消费券接口 !!!
	static COMIC_COUPON_COST = "https://manga.bilibili.com/twirp/comic.v1.Comic/BuyEpisode?device=pc&platform=web";

	static STAOP = false;

	static DELAY_TIME = 0; //延迟1 s

	//构造函数  漫画的id
	constructor(comic_id){
		this.comic_id = comic_id;
		this.ep_list = new Array();
		this.unlock_epList = new Array();
		this.jobList = new Array(); //任务列表
	}

	appendLog(str){
		$('#log_div').append($("<label>" + str + "</label><br/>"));
	}

	//过滤免费章节
	filter_unlock_ep() {
		this.appendLog("[Info][过滤免费章节]");
		var resArray = new Array();
		for (var i = this.ep_list.length - 1; i >= 0; i--) {
			var epModel = this.ep_list[i];
			if (epModel.is_locked) {
				resArray.push(epModel);
			}
		}
		this.unlock_epList = resArray;
		this.appendLog("[Info][过滤免费章节][Done]")
		this.appendLog("[Info][创建Job 数组]")
		this.jobList = resArray.slice(0, ComicAutoCostCoupon.COMIC_COUPON_SETP).reverse();
		this.appendLog("[Info][创建Job 数组][Done]")
	}

	//delay 延迟消耗
	delay_cost_coupon (ep_id, title, recommend_coupon_id) {

		self = this;
		setTimeout( function(){
			self.cost_coupon_BuyCommic(ep_id, title, recommend_coupon_id);
		}, ComicAutoCostCoupon.DELAY_TIME * 1000);
	}

	//漫读券 消耗
	cost_coupon_BuyCommic(ep_id, title, recommend_coupon_id) {
		if (ComicAutoCostCoupon.STAOP) {
			this.appendLog("[Info][Stop]");
			return;
		}
		var buy_info = {
			"buy_method":2,
			"ep_id":ep_id,
			"coupon_id":recommend_coupon_id,
			"auto_pay_gold_status":2
		}
		let self = this;
		this.appendLog("[Info][请求 花费 漫读券]  title :" + title);
		$.post(ComicAutoCostCoupon.COMIC_COUPON_COST, buy_info, function(response) {
			if (response.code != 0 ) {
				self.appendLog("[Error][请求 花费 漫读券][失败 msg: "+ response.msg + "]");
				return;
			}
			self.appendLog("[Info][请求 花费 漫读券][Done] 下一张");
			self.get_recommend_coupon_id();
		});
	}

	//获取推荐漫读券
	get_recommend_coupon_id() {

		var epModel = this.jobList.pop();
		if (typeof(epModel) == "undefined") {
			this.appendLog("[Warn][Job Done]");
			return;
		}
		let self = this;
		this.appendLog("[Info][请求推荐漫读券]");
		$.post(ComicAutoCostCoupon.COMIC_GET_RECOMMOND_ID, {"ep_id":epModel.id}, function(response){
			if (response.code != 0 ) {
				self.appendLog("[Error][请求推荐漫读券][失败 msg: "+ response.msg + "]");
				return;
			}
			self.appendLog("[Info][推荐漫读券][Done]  recommend_coupon_id : " + response.data.recommend_coupon_id);
			
			self.delay_cost_coupon(epModel.id, epModel.title , response.data.recommend_coupon_id);
		});
	}

	//获取章节列表
	get_epList() {

		let self = this;
		this.appendLog("[Info][请求章节列表]");
		$.post(ComicAutoCostCoupon.COMIC_DETAIL_URL, {"comic_id":this.comic_id}, function(response){
			if (response.code != 0) {
				self.appendLog("[Error][请求章节列表][失败 msg: "+ response.msg + "]");
				return;
			}
			self.ep_list = response.data.ep_list;
			self.filter_unlock_ep();
			self.appendLog("[Info][章节数 : " + self.ep_list.length + "] [付费章节数 : " + self.unlock_epList.length + "] [Job 任务数 :" + self.jobList.length + "]");
			self.get_recommend_coupon_id();
		});
	}

	start() {
		this.get_epList();
	}
	
}

$(function(){
	
	//调用background.js  中的方法
	function call_bg_function() {

		var bg = chrome.extension.getBackgroundPage();
		bg.test();
	};

	function sendMessageToBackground_js () {
		chrome.extension.sendMessage({msg: 'send a message'},(response) => { 
		    console.log(response); 
		});
	}

	function clearLog(){
		$('#log_div').empty();
		appendLog("[Info][运行日志]");
	}

	function appendLog(str){
		$('#log_div').append($("<label>" + str + "</label><br/>"));
	}

	//自动消耗漫读券
	function autoCostCoupon() {
		clearLog();
		
		chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
			var str = tabs[0].url;
			var comic_id = str.match(/\d{5}/g)[0];
			var cost = new ComicAutoCostCoupon(comic_id);
			appendLog("[Info][获取comic_id: " + comic_id + "]");
			cost.start();
	    });
	}

	$("#button_start").click(function() {
		var step = parseInt(document.getElementById('input_step').value);
		if (!isNaN(step)) {
			ComicAutoCostCoupon.COMIC_COUPON_SETP = parseInt(document.getElementById('input_step').value)	
		}
		ComicAutoCostCoupon.STAOP = false;
		autoCostCoupon();
	});
	$("#button_stop").click(function() {

		ComicAutoCostCoupon.STAOP = true;
	});
});

