
const init_times = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35].map(i=>i.toFixed(6))
const init_values = [0,1,3,6,10,14,17,19,20,19,17,14,10,11,13,16,18,22,25,27,28,28.5,28.7,28,25,22,18,15,13,12,11.5,11,11.5,11.1,11.05].map(i=>i.toFixed(3))
const init_filter = [1.333, 2.533, 4.533, 7.333, 10.533, 13.733, 16.533, 18.333, 18.933, 18.333, 16.533, 14.733, 13.533, 13.333, 14.133, 16.533, 19.333, 22.133, 24.533, 26.633, 27.973, 28.573, 28.173, 26.973, 24.873, 22.133, 19.133, 16.533, 14.433, 13.033, 12.333, 11.953, 11.763, 11.673, 11.683]
const init_peaks = [
  {
    state:{
      startPoint_time: Number(16).toFixed(6),
      startPoint_voltage: 16.533,
      retention_time: Number(22).toFixed(6),
      heighestPoint_voltage: 28.573,
      valleyPoint_time: Number(14).toFixed(6),
      valleyPoint_voltage: 13.333,
      leftInflection_time: Number(17).toFixed(6),
      leftInflection_voltage: 19.333,
      rightInflection_time: Number(25).toFixed(6),
      rightInflection_voltage: 24.873,
      endPoint_time: Number(34).toFixed(6),
      endPoint_voltage: 11.673,
    }
  }
]

export const dataReducer = (
  state = {
    data_origin: {},
    data_filtered: [],
    data_peakIdent: [],
    result_computed: []
  }, 
  action 
) => {
  switch(action.type){
    case 'upgrade_origin_data':
      console.log('reducer 原始数据：', action.payload)
      return {
        ...state, data_origin: action.payload
      }
    ;
    case 'save_filter_data':
      return {
        ...state, data_filtered: action.payload
      }
    ;
    case 'save_peak_identified':
      return {
        ...state, data_peakIdent: action.payload
      }
    ;
    case 'save_computed':
      return {
        ...state, result_computed: action.payload
      }
    ;
    case 'clear':
      return {
        data_origin: {times:[], values:[]},
        data_filtered: [],
        data_peakIdent: [],
        result_computed: []
      }
    ;
    default: return state
  }
}