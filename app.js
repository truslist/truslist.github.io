// Header word cloud for TrusList homepage
// Uses WordCloud2.js (loaded from CDN in index.html)

document.addEventListener('DOMContentLoaded', function() {
  drawHeaderWordCloud();
});

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function drawHeaderWordCloud() {
  // Selected domains (trimmed example list)
  const selectedDomains = [
    {text:'microsoft.com', size:70, rank:1}, {text:'baidu.com', size:62, rank:3}, {text:'google.com', size:60, rank:8},
    {text:'qq.com', size:58, rank:2}, {text:'office.com', size:52, rank:9}, {text:'apple.com', size:50, rank:7},
    {text:'googleapis.com', size:48, rank:5}, {text:'360.cn', size:46, rank:4}, {text:'bing.com', size:40, rank:64},
    {text:'douyincdn.com', size:38, rank:6}, {text:'live.com', size:34, rank:27}, {text:'taobao.com', size:32, rank:68},
    {text:'bilibili.com', size:30, rank:67}, {text:'tencent.com', size:28, rank:201}, {text:'163.com', size:24, rank:206}
  ];

  const canvas = document.getElementById('wordcloudCanvas');
  if (!canvas || !window.WordCloud) return;

  const dpr = window.devicePixelRatio || 1;
  const wrapper = canvas.parentElement; // .wordcloud-wrap
  const rect = wrapper.getBoundingClientRect();

  // size canvas in device pixels and style in CSS pixels
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  canvas.style.width = rect.width + 'px';
  canvas.style.height = rect.height + 'px';

  // tuned parameters for a large, dense, visually-pleasing header cloud
  const grid = Math.max(3, Math.round(rect.width / 60));
  const weightFactor = function(size) { return Math.max(8, Math.round(size * dpr * 1.8)); };

  const palette = ['#7B5FBF','#4A90E2','#4ECDC4','#FFB74D','#E57373','#BA68C8','#6FE8E0','#FF9800'];

  WordCloud(canvas, {
    list: selectedDomains.map(d => [d.text, d.size]),
    gridSize: grid,
    weightFactor: weightFactor,
    fontFamily: 'Arial, "Microsoft YaHei", sans-serif',
    color: function(word, weight) { return palette[Math.abs(hashCode(word)) % palette.length]; },
    rotateRatio: 0.2,
    rotationSteps: 2,
    backgroundColor: 'transparent',
    drawOutOfBound: false,
    minSize: 8,
    hover: function(item, dimension) {
      if (item) {
        canvas.style.cursor = 'pointer';
        const domain = selectedDomains.find(d => d.text === item[0]);
        canvas.title = domain ? `${domain.text} (排名 #${domain.rank})` : item[0];
      } else {
        canvas.style.cursor = 'default';
        canvas.title = '';
      }
    },
    click: function(item) {
      if (!item) return;
      const domain = item[0];
      if (/^[a-z0-9.-]+$/i.test(domain)) {
        window.open('https://' + domain, '_blank');
      }
    }
  });
}
// Interactive charts and word cloud for TrusList demo
// Uses Chart.js and WordCloud2.js via CDN

document.addEventListener('DOMContentLoaded', function() {
  
  // Step 1: Draw word cloud in header using real Top 100 domains from CSV data
  drawHeaderWordCloud();

  // Top-N Overlap data (from paper summary)
  const labels = ['Top-100','Top-500','Top-1000','Top-10000'];
  const sec_vs_umb = [0.96,0.942,0.910,0.985];
  const trus_vs_secr = [0.35,0.32,0.30,1.00];
  const trus_vs_umb = [0.34,0.31,0.295,0.998];

  // TopN chart with animation
  const ctxTopn = document.getElementById('chartTopN').getContext('2d');
  new Chart(ctxTopn, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {label: 'SecRank vs Umbrella', data: sec_vs_umb, borderColor:'#1f77b4', backgroundColor:'rgba(31,119,180,0.06)', fill:true, tension:0.3, borderWidth:2},
        {label: 'TrusList vs SecRank', data: trus_vs_secr, borderColor:'#ff7f0e', backgroundColor:'rgba(255,127,14,0.06)', fill:true, tension:0.3, borderWidth:2},
        {label: 'TrusList vs Umbrella', data: trus_vs_umb, borderColor:'#2ca02c', backgroundColor:'rgba(44,160,44,0.06)', fill:true, tension:0.3, borderWidth:2}
      ]
    },
    options: {
      responsive:true,
      animation:{duration:1500, easing:'easeInOutQuart'},
      plugins:{legend:{position:'bottom'}},
      scales:{y:{min:0, max:1, title:{display:true,text:'Overlap Rate'}}}
    }
  });

  // CDF sample data (representative)
  const xCDF = Array.from({length:101}, (_,i)=>i);
  // generate sample CDF curves (shifted)
  const sec_cdf = xCDF.map(x=>Math.min(1, Math.pow(x/100,0.9)));
  const trus_cdf = xCDF.map(x=>Math.min(1, Math.pow(x/100,1.4))); // right-shifted
  const baseline_cdf = xCDF.map(x=>Math.min(1, Math.pow(x/100,0.8)));

  const ctxCDF = document.getElementById('chartCDF').getContext('2d');
  new Chart(ctxCDF, {
    type:'line',
    data:{
      labels:xCDF,
      datasets:[
        {label:'SecRank (baseline)', data: sec_cdf, borderColor:'#1f77b4', pointRadius:0, borderWidth:2},
        {label:'TrusList', data: trus_cdf, borderColor:'#d62728', pointRadius:0, borderWidth:2},
        {label:'Traffic-only baseline', data: baseline_cdf, borderColor:'#9467bd', pointRadius:0, borderWidth:2}
      ]
    },
    options:{
      responsive:true,
      animation:{duration:1500, easing:'easeInOutQuart'},
      plugins:{legend:{position:'bottom'}},
      scales:{x:{title:{display:true,text:'Rank position (smaller is higher visibility)'}}, y:{min:0,max:1,title:{display:true,text:'CDF'}}}
    }
  });

  // Word cloud -- sample domains/terms (weights approximate visibility)
  const words = [
    {text:'m.baidu.com',size:60},{text:'conn1.oppomobile.com',size:44},{text:'dns.weixin.qq.com.cn',size:40},
    {text:'vcode-od.vivo.com.cn',size:36},{text:'info.3g.qq.com',size:32},{text:'txmov6.a.yximgs.com',size:30},
    {text:'conn3.coloros.com',size:28},{text:'static.yximgs.com',size:26},{text:'p4.a.yximgs.com',size:24},
    {text:'apd-pcdnwxnat.teg.tencent-cloud.net',size:22},{text:'phishing',size:20},{text:'DGA',size:18},
    {text:'Registrar',size:16},{text:'TLD',size:14},{text:'Spearman',size:12}
  ];

  // render word cloud using d3 + d3.layout.cloud
  function drawWordCloud() {
    const container = document.getElementById('wordCloud');
    container.innerHTML = '';
    const width = container.clientWidth || 420;
    const height = 300;

    // If WordCloud2.js is available (more compatible), use it
    if (window.WordCloud) {
      const list = words.map(w => [w.text, w.size]);
      // parameters tuned for responsiveness with hover effect
      WordCloud(container, {
        list: list,
        gridSize: Math.max(8, Math.round(width / 25)),
        weightFactor: function(size){ return size / 2; },
        fontFamily: 'Impact',
        color: function(word, weight){
          const palette = ['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd'];
          return palette[Math.abs(hashCode(word)) % palette.length];
        },
        rotateRatio: 0.3,
        rotationSteps: 2,
        backgroundColor: 'transparent',
        drawOutOfBound: false,
        // Enable hover effect
        hover: function(item, dimension, event) {
          if (dimension) {
            container.style.cursor = 'pointer';
          } else {
            container.style.cursor = 'default';
          }
        },
        click: function(item) {
          console.log('Clicked:', item[0]);
        }
      });
      // Add fade-in animation
      container.style.opacity = '0';
      setTimeout(()=> { container.style.transition='opacity 1s ease'; container.style.opacity='1'; }, 100);
      return;
    }

    // fallback to d3-cloud if available
    if (typeof d3 !== 'undefined' && d3.layout && d3.layout.cloud) {
      const layout = d3.layout.cloud()
        .size([width, height])
        .words(words.map(d => ({text:d.text, size:d.size})))
        .padding(4)
        .rotate(() => (Math.random() > 0.7 ? 90 : 0))
        .font('Impact')
        .fontSize(d=>d.size)
        .on('end', draw);

      layout.start();

      function draw(words) {
        const svg = d3.select('#wordCloud').append('svg')
          .attr('width', width)
          .attr('height', height)
          .append('g')
          .attr('transform', 'translate(' + width/2 + ',' + height/2 + ')');

        svg.selectAll('text')
          .data(words)
          .enter().append('text')
          .style('font-size', d => d.size + 'px')
          .style('font-family', 'Impact')
          .style('fill', (d,i) => ['#1f77b4','#ff7f0e','#2ca02c','#d62728','#9467bd'][i%5])
          .attr('text-anchor','middle')
          .attr('transform', d => 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')')
          .text(d => d.text);
      }
    } else {
      container.innerHTML = '<p class="small">词云需要浏览器访问外部脚本或使用本地服务器以加载依赖（见 README 中的预览说明）。</p>';
    }
  }

  // initial draw
  if (typeof d3 !== 'undefined' && d3.layout && d3.layout.cloud) {
    drawWordCloud();
  } else {
    // if cloud layout not loaded, attempt load library then draw
    console.warn('d3-cloud unavailable; word cloud may not render.')
  }

  // simple toggle between image and interactive charts with animation
  document.getElementById('toggleCharts').addEventListener('click', function(){
    const charts = document.getElementById('interactiveArea');
    const img = document.getElementById('figureArea');
    if (charts.style.display === 'none') {
      img.style.opacity='0';
      setTimeout(()=>{img.style.display='none'; charts.style.display='block'; charts.style.opacity='0'; setTimeout(()=>{charts.style.transition='opacity 0.5s'; charts.style.opacity='1';},50);},300);
      this.textContent='显示图片预览';
    } else {
      charts.style.opacity='0';
      setTimeout(()=>{charts.style.display='none'; img.style.display='block'; img.style.opacity='0'; setTimeout(()=>{img.style.transition='opacity 0.5s'; img.style.opacity='1';},50);},300);
      this.textContent='显示交互图表';
    }
  });

  // Helper function for word color hashing
  function hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
  
  // Draw word cloud in header using Top 100 domains from real ranking data
  function drawHeaderWordCloud() {
    // 75 domains from MergeTopList2025-08-15.csv
    const selectedDomains = [
      {text:'microsoft.com', size:50, rank:1},
      {text:'qq.com', size:48, rank:2},
      {text:'baidu.com', size:46, rank:3},
      {text:'360.cn', size:44, rank:4},
      {text:'googleapis.com', size:42, rank:5},
      {text:'douyincdn.com', size:40, rank:6},
      {text:'apple.com', size:38, rank:7},
      {text:'google.com', size:36, rank:8},
      {text:'office.com', size:34, rank:9},
      {text:'beian.gov.cn', size:32, rank:10},
      {text:'mee.gov.cn', size:30, rank:12},
      {text:'gsxt.gov.cn', size:28, rank:13},
      {text:'live.com', size:26, rank:27},
      {text:'nsfc.gov.cn', size:24, rank:28},
      {text:'most.gov.cn', size:22, rank:29},
      {text:'court.gov.cn', size:20, rank:30},
      {text:'sh.gov.cn', size:20, rank:31},
      {text:'shanghai.gov.cn', size:19, rank:32},
      {text:'chinatax.gov.cn', size:18, rank:33},
      {text:'cma.gov.cn', size:18, rank:34},
      {text:'cnipa.gov.cn', size:17, rank:35},
      {text:'mof.gov.cn', size:17, rank:36},
      {text:'sz.gov.cn', size:16, rank:37},
      {text:'zj.gov.cn', size:16, rank:38},
      {text:'moa.gov.cn', size:15, rank:39},
      {text:'cq.gov.cn', size:15, rank:40},
      {text:'shandong.gov.cn', size:14, rank:41},
      {text:'tj.gov.cn', size:14, rank:42},
      {text:'fujian.gov.cn', size:13, rank:44},
      {text:'mohrss.gov.cn', size:13, rank:45},
      {text:'gansu.gov.cn', size:12, rank:46},
      {text:'hainan.gov.cn', size:12, rank:47},
      {text:'bing.com', size:12, rank:64},
      {text:'windows.com', size:11, rank:66},
      {text:'bilibili.com', size:11, rank:67},
      {text:'taobao.com', size:10, rank:68},
      {text:'jiangsu.gov.cn', size:10, rank:69},
      {text:'wps.cn', size:10, rank:70},
      {text:'beijing.gov.cn', size:9, rank:77},
      {text:'gd.gov.cn', size:9, rank:80},
      {text:'miit.gov.cn', size:9, rank:81},
      {text:'ustc.edu.cn', size:8, rank:83},
      {text:'tsinghua.edu.cn', size:8, rank:84},
      {text:'sjtu.edu.cn', size:8, rank:85},
      {text:'pku.edu.cn', size:8, rank:88},
      {text:'hicloud.com', size:7, rank:90},
      {text:'nju.edu.cn', size:7, rank:95},
      {text:'fudan.edu.cn', size:7, rank:96},
      {text:'zju.edu.cn', size:7, rank:98},
      {text:'sogou.com', size:7, rank:100},
      {text:'tencent.com', size:6, rank:201},
      {text:'163.com', size:6, rank:206},
      {text:'dingtalk.com', size:6, rank:208},
      {text:'douyin.com', size:6, rank:247},
      {text:'whu.edu.cn', size:5, rank:101},
      {text:'sysu.edu.cn', size:5, rank:102},
      {text:'ruc.edu.cn', size:5, rank:103},
      {text:'hust.edu.cn', size:5, rank:104},
      {text:'sdu.edu.cn', size:5, rank:105},
      {text:'bnu.edu.cn', size:5, rank:106},
      {text:'tju.edu.cn', size:5, rank:107},
      {text:'xmu.edu.cn', size:5, rank:108},
      {text:'buaa.edu.cn', size:5, rank:109},
      {text:'xjtu.edu.cn', size:5, rank:110},
      {text:'cau.edu.cn', size:5, rank:111},
      {text:'hit.edu.cn', size:5, rank:112},
      {text:'nankai.edu.cn', size:5, rank:113},
      {text:'cqu.edu.cn', size:5, rank:114},
      {text:'neu.edu.cn', size:5, rank:115},
      {text:'jlu.edu.cn', size:5, rank:116},
      {text:'bjtu.edu.cn', size:5, rank:118},
      {text:'lzu.edu.cn', size:5, rank:119},
      {text:'seu.edu.cn', size:5, rank:120},
      {text:'uestc.edu.cn', size:5, rank:121},
      {text:'dlut.edu.cn', size:5, rank:122}
    ];
    
    const canvas = document.getElementById('wordcloudCanvas');
    if (!canvas) return;
    
    // 自动铺满 canvas 区域
    const dpr = window.devicePixelRatio || 2;
    const container = canvas.parentElement;
    const rect = container.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    
    // Use WordCloud2.js for static, clean word cloud
    if (window.WordCloud) {
      const list = selectedDomains.map(w => [w.text, w.size]);
      
      // Color palette inspired by the reference image (purples, blues, greens, oranges)
      const colorPalette = [
        '#7B5FBF', '#9B7FD5', '#6A4C9C', // purples (dark to light)
        '#4A90E2', '#5DA5E8', '#7BB8F0', // blues
        '#4ECDC4', '#5DDAD2', '#6FE8E0', // cyan/greens
        '#FFB74D', '#FFA726', '#FF9800', // oranges
        '#E57373', '#EF9A9A', '#F48FB1', // pinks/reds
        '#AB47BC', '#BA68C8', '#CE93D8'  // more purples
      ];
      
      WordCloud(canvas, {
        list: list,
        gridSize: Math.round(6 * dpr),
        weightFactor: function(size) {
          return size * dpr * 1.2;
        },
        fontFamily: 'Arial, Microsoft YaHei, sans-serif',
        fontWeight: '600',
        color: function(word, weight){
          // Assign colors based on word hash for consistency
          return colorPalette[Math.abs(hashCode(word)) % colorPalette.length];
        },
        rotateRatio: 0.3,
        rotationSteps: 2,
        backgroundColor: 'transparent',
        drawOutOfBound: false,
        minSize: Math.round(5 * dpr),
        // Enhanced hover effect with visual feedback
        hover: function(item, dimension, event) {
          if (dimension) {
            canvas.style.cursor = 'pointer';
            canvas.style.filter = 'brightness(1.1)';
            const domain = selectedDomains.find(d => d.text === item[0]);
            if (domain) {
              canvas.title = `${item[0]} (排名 #${domain.rank})`;
            }
          } else {
            canvas.style.cursor = 'default';
            canvas.style.filter = 'none';
            canvas.title = '';
          }
        },
        click: function(item) {
          const domain = selectedDomains.find(d => d.text === item[0]);
          if (domain) {
            alert(`✨ 域名: ${domain.text}\n📊 排名: #${domain.rank}\n📅 来源: TrusList 2025-08-15 实验数据`);
          }
        }
      });
      
      // Smooth fade-in effect
      canvas.style.opacity = '0';
      setTimeout(()=> { 
        canvas.style.transition='opacity 2s ease'; 
        canvas.style.opacity='1'; 
      }, 200);
    } else {
      console.warn('WordCloud2.js not loaded');
    }
  }

});
