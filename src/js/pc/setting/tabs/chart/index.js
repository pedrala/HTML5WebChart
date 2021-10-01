import baseHtml from '../../../../../html/pc/setting/tabs/chart/index.html';

import accordionView from './accordion-view'
import treeView from './tree-view'

import utils from '../../../../common/utils'
import t from '../../../../common/i18n'

// 탭 01: 차트/지표
export default (rChart, selectId) => {
  const $baseHtml = $(baseHtml); 
  const $accordion_area = $('.accordion_area', $baseHtml);
  const $move_btn_area = $('.move_btn_area', $baseHtml);
  const $indi_ctrl_view = $('.indi_ctrl_view', $baseHtml),
    $tree_area = $('.tree_area', $indi_ctrl_view);
  const $setting_view = $('.setting_view', $baseHtml),
    $setting_view_footer = $('.setting_view_footer', $setting_view);

  // 그룹화된 지표 목록 
  const indicators = utils.getIndicators();

  // 지표 검색
  accordionView.catcomplete($baseHtml, indicators);

  // 지표 목록
  accordionView.accordion($baseHtml, indicators);

  rChart.ReArrangeAreaIndex();

  // 그려져 있는 지표 목록
  treeView.tree($baseHtml, rChart, selectId);

  //////////////////////////////
  //지표 추가 버튼 이벤트
  //////////////////////////////
  $('button#btnAdd', $move_btn_area).on('click', function () {
    const name = $('li.active', $accordion_area).data('name');
    if (!name) {
      rChart.Alert(t('chart.selectindicator'), function () {
        // TODO: 포커스 이동??
      });
      return false;
    }

    const ref = $tree_area.jstree(true),    
      sel = ref.get_selected(),
      selectedNode = ref.get_node(sel[0]);
    
    let rSelectedGraph = null;
    let rSelectedChartBlock = undefined;
    let strRQ = null;
    if(selectedNode.id.indexOf('area') !== -1)//트리컨트롤의 영역이 선택된 경우
    {
      rSelectedChartBlock = rChart.GetChartBlockByKey(selectedNode.data.block_key);
    }
    else{//트리컨트롤의 그래프 선택된 경우

      rSelectedGraph = rChart.GetGraphByKey(selectedNode.id);
      if(rSelectedGraph && rSelectedGraph.m_rBlock){
        rSelectedChartBlock = rSelectedGraph.m_rBlock;
        strRQ = rSelectedGraph.m_rRQSet.m_strRQ;
      }
    }
    if(!strRQ){
      strRQ = rChart.GetSelectedRQ();
    }
    // TODO: onlyOne 이 뜻하는 것은? 선택한 영역으로 넣기 위한 방법은?
    const onlyOne = '_MA_,_VOLUME_,_VMA_'.indexOf(name) !== -1;
    if(onlyOne === true){
      let rG = rChart.GetGraphByNameInRQ(strRQ, name);
      if(rG){
        ref.deselect_all(true);
        ref.select_node(rG.m_strKey, false, false);
        return false;//이미 존재하므로 리턴
      }
    }
    const id = rChart.SimpleAddIndicator(name, onlyOne, undefined, rSelectedChartBlock, strRQ);

    // 트리영역 새로고침
    if (id) {
      // 추가한 지표 KEY 저장
      //ref.currentId = id;
      let rGraph = rChart.GetGraphByKey(id);
      if(rGraph)
      {
        let strBlockID = "area_" + (rGraph.m_rBlock.GetAreaIndex());
        let rBlockNode = ref.get_node(strBlockID, true);
        if(!rBlockNode){
          strBlockID = treeView.createArea(ref, rGraph.m_rBlock);
        }
        treeView.createGraph(ref, strBlockID, rGraph);
        ref.deselect_all(true);
        ref.select_node(id, false, false);
        return true;
      }
    }
    return false;
  });

  ///////////////////////////
  //지표 삭제 버튼 이벤트
  ///////////////////////////
  $('button#btnRemove', $move_btn_area).on('click', function () {
    let ref = $tree_area.jstree(true),
      sel = ref.get_selected(),
      node = ref.get_node(sel),
      parent = ref.get_parent(sel),
      pNode = ref.get_node(parent),
      rMainBlock = rChart.m_MainBlock;

    if (!sel.length){
      return false;
    }

    sel = sel[0];

    // 선택한 대상이 parent 에 해당하면 삭제하지 않는다.
    if (ref.is_parent(sel)) {
      return false;
    }
    
    // 삭제불가 지표는 삭제하지 않는다.
    if (node.data.canNotDelete) {
      return false;
    }

    // 지표 삭제
    let rGraph = rChart.GetGraphByKey(sel);
    if(rGraph){

      let rChartBlock = rGraph.m_rBlock;
      let nGraphCnt = rChartBlock.m_GraphArray.length;
      let i, nGraphIndex = null;
      for(i = 0 ; i < nGraphCnt; i++){
        let rG = rChartBlock.m_GraphArray[i];
        if(rGraph === rG){
          nGraphIndex = i;
          break;
        }
      }

      let rSelectGraph = null;
      let nChartBlockIndex = rChartBlock.GetBlockIndex();
      if(rChart.SettingDeleteIndicator(sel))
      {        
        ref.deselect_all(true);
        ref.delete_node(sel);

        //그래프 삭제전 차트블록에 그래프가 하나만 남아있었을 경우, 그래프 삭제 후 블록도 삭제한다
        if(nGraphCnt === 1){
          
          if(nChartBlockIndex === 0){
            rChartBlock = rMainBlock.m_ChartBlockArray[nChartBlockIndex];            
          }
          else{
            rChartBlock = rMainBlock.m_ChartBlockArray[nChartBlockIndex - 1];
          }

          rSelectGraph = rChartBlock.m_GraphArray[rChartBlock.m_GraphArray.length - 1];

          ref.delete_node(parent);    
        }
        else{

          if(nGraphIndex === 0){
            rSelectGraph = rChartBlock.m_GraphArray[nGraphIndex];
          }
          else{
            rSelectGraph = rChartBlock.m_GraphArray[nGraphIndex - 1];
          }
        }

        if(rSelectGraph){
          ref.select_node(rSelectGraph.m_strKey, false, false);
        }

      }
    }
  });

  //////////////////////////
  // 영역 추가
  //////////////////////////
  $('button#btnAddArea', $indi_ctrl_view).on('click', function () {
    const ref = $tree_area.jstree(true);

    let rNewBlock = rChart.AddBlock();
    
    treeView.createArea(ref, rNewBlock);

    let strAearID = 'area_' + (rNewBlock.GetAreaIndex());

    ref.deselect_all(true);
    ref.select_node(strAearID, false, false);
    // 영역 추가 후 추가된 영역을 선택하기 위한 id 저장
    //ref.currentId = 'area_' + rChart.m_MainBlock.m_ChartBlockArray.length;
    //ref.refresh();
  });

  //////////////////////
  // 영역 삭제
  //////////////////////
  $('button#btnRemoveArea', $indi_ctrl_view).on('click', function () {
    let ref = $tree_area.jstree(true),
      selNodes = ref.get_selected();

    if (!selNodes.length) return false;
    let selNode = selNodes[0];

    // 선택한 대상이 지표이면 해당 지표가 포함된 영역을 삭제한다.
    let selArea = null;
    if (ref.get_type(selNode) !== 'area') {
      selArea = ref.get_parent(selNode);
    }
    else{
      selArea = selNode;
    }
    
    const nodeArea = ref.get_node(selArea),
      rMainBlock = rChart.m_MainBlock,
      rChartBlockArray = rMainBlock.m_ChartBlockArray;

    // 삭제불가 지표가 있으면 삭제하지 않는다.
    /*let canNotDelete = false;
    nodeArea.children.forEach((cKey) => {      
      canNotDelete += ref.get_node(cKey).data.canNotDelete;
    });
    if(canNotDelete) return false;    
    */

    // 해당 영역내 지표 삭제 후 영역을 삭제한다.    
    let i, rGraph;
    let strBlockKey = nodeArea.data.block_key;    
    let curChartBlock = rChart.GetChartBlockByKey(strBlockKey);
    let strGraphKeyArray = [];
    let nGraphLen = curChartBlock.m_GraphArray.length;
    let nBlockIndex = curChartBlock.GetBlockIndex();
    for(i = 0; i < nGraphLen; i++ ){
      strGraphKeyArray[strGraphKeyArray.length] = curChartBlock.m_GraphArray[i].m_strKey;      
    }

    if(!rChart.DeleteBlock(curChartBlock)){
      return false;
    }
    
    let nPrevBlockIndex = nBlockIndex === 0 ? 0 : nBlockIndex - 1;

    for(i = 0; i < nGraphLen ; i++ ){
      ref.delete_node(strGraphKeyArray[i]);
    }
    ref.delete_node(selArea);    

    let rChartBlock, strAreaID, rG;
    if( nBlockIndex < rChartBlockArray.length ){

      rChartBlock = rChartBlockArray[nBlockIndex];
      if(rChartBlock.m_GraphArray.length <= 0){
        strAreaID = "area_" + rChartBlock.GetAreaIndex();
        ref.select_node(strAreaID, false, false);
      }
      else{
        rG = rChartBlock.m_GraphArray[0];
        ref.select_node(rG.m_strKey, false, false);
      }
    }
    else{
      
      rChartBlock = rChartBlockArray[nBlockIndex - 1];
      let nGraphLen = rChartBlock.m_GraphArray.length;
      if(nGraphLen <= 0){
        strAreaID = "area_" + rChartBlock.GetAreaIndex();
        ref.select_node(strAreaID, false, false);
      }
      else{
        let nIdx = nGraphLen - 1;
        rG = rChartBlock.m_GraphArray[nIdx];
        ref.select_node(rG.m_strKey, false, false);
      }
    }

  });

  ///////////////////////////////////
  // 맨 위로 / 맨 아래로
  ///////////////////////////////////
  $('button#btnDbUp, button#btnDbDown', $indi_ctrl_view).on('click', function (e) {

    let ref = $tree_area.jstree(true),
      sel = ref.get_selected();
    
    if (!sel.length) {
      return false;
    }
    sel = sel[0];

    //영역이 선택된 경우
    if (ref.get_type(sel) === 'area') {

      const node = ref.get_node(sel),
        rChartBlock = rChart.GetChartBlockByKey(node.data.block_key),
        nodeIdx = rChartBlock.GetBlockIndex();        

      let selParent = ref.get_parent(sel);

      if (e.target.id === 'btnDbUp') {

        rChart.MoveBlockToHead(nodeIdx);
        ref.move_node(sel, selParent, 'first');
      } else {

        rChart.MoveBlockToTail(nodeIdx);
        ref.move_node(sel, selParent, 'last');
      }

      treeView.EnableMoveBtns($baseHtml, ref, rChart, sel);

    }else{//지표 선택된 경우

      if (e.target.id === 'btnDbUp') {
        if(rChart.MoveGraphToHeadByKey(sel)){

          let rHeadBlock = rChart.GetChartBlockHead();
          if(rHeadBlock){
            let nAreaIndex = rHeadBlock.GetAreaIndex();
            let selHead = 'area_' + nAreaIndex;
            ref.move_node(sel, selHead, 'first');
          }
        }
      } else {
        if(rChart.MoveGraphToTailByKey(sel)){

          let rTailBlock = rChart.GetChartBlockTail();
          if(rTailBlock){
            let nAreaIndex = rTailBlock.GetAreaIndex();
            let selTail = 'area_' + nAreaIndex;
            ref.move_node(sel, selTail, 'last');
          }
        }
      }
      
      treeView.EnableMoveBtns($baseHtml, ref, rChart, sel);

      // 재선택 key
      //ref.currentId = sel;
    }

    //ref.refresh();
  });

  ///////////////////////////////////////
  // 한칸 위로 / 한칸 아래로
  ///////////////////////////////////////
  $('button#btnUp, button#btnDown', $indi_ctrl_view).on('click', function (e) {
    let ref = $tree_area.jstree(true),
      sel = ref.get_selected();
    if (!sel.length) {
      return false;
    }
    sel = sel[0];

    
    let bPrevOrNext = false;//아래로 이동
    if (e.target.id === 'btnUp'){
      bPrevOrNext = true;//위로 이동      
    }

    if (ref.get_type(sel) === 'area') {
      let node = ref.get_node(sel);
      let rChartBlock = rChart.GetChartBlockByKey(node.data.block_key);
      let nBlockIndex = rChartBlock.GetBlockIndex();

      rChart.MoveBlock(nBlockIndex, bPrevOrNext);

      let nNewBlockIndex = rChartBlock.GetBlockIndex();
      let selParent = ref.get_parent(sel);
      if(bPrevOrNext === false){//위로 이동
        nNewBlockIndex++;
      }
      ref.move_node(sel, selParent, nNewBlockIndex);
      treeView.EnableMoveBtns($baseHtml, ref, rChart, sel);
      
    } else {

      let rSelGraph = rChart.GetGraphByKey(sel);
      let nAreaIndex = rSelGraph.m_rBlock.GetAreaIndex();

      rChart.MoveGraphByKey(sel, bPrevOrNext);
      
      let nGraphIndex = rSelGraph.GetGraphIndexInBlock();
      let nNewAreaIndex = rSelGraph.m_rBlock.GetAreaIndex();
      let strBlockID = "area_" + nNewAreaIndex;
      if(nAreaIndex !== nNewAreaIndex){

        ref.move_node(sel, strBlockID, nGraphIndex);

      }
      else{

        if(bPrevOrNext === false){//위로 이동
          nGraphIndex++;
        }
        ref.move_node(sel, strBlockID, nGraphIndex);

      }      
      
      //ref.move_node(sel, strBlockID, strPrevOrNext);     
      treeView.EnableMoveBtns($baseHtml, ref, rChart, sel);

    }
    
    //ref.refresh();
  });    

  //////////////////////////////
  // 초기화 버튼
  //////////////////////////////
  $('a.btn_reset', $setting_view_footer).on('click', function (e) {
    e.preventDefault();
    
    let ref = $tree_area.jstree(true),
      sel = ref.get_selected();      

    if (!sel.length) return false;
    sel = sel[0];

    rChart.SetDefaultIndicatorPropertyToChart(sel);

    ref.deselect_all();
    ref.select_node(sel);
  });

  //////////////////////////////
  // 기본값 저장 버튼
  //////////////////////////////
  $('a.btn_default', $setting_view_footer).on('click', function (e) {
    e.preventDefault();
    
    let ref = $tree_area.jstree(true),
      sel = ref.get_selected();

    if (!sel.length) return false;
    sel = sel[0];

    const selectedNode = ref.get_node(sel);

    rChart.ChangeDefaultIndicatorProperty(
      selectedNode.data.name,
      rChart.GetPropertyInfo(selectedNode.id),
    );
  });

  // 국제화 언어 적용
  $baseHtml.localize();
  $('#catcomplete > input', $baseHtml).prop('placeholder', t('chart.indexsearch'))

  return $baseHtml;
};