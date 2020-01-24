export const upgradeOriginData = (prjTitle, times, values) => ({
  type:'upgrade_origin_data',
  payload: {prjTitle, times, values}
})

export const savefilteredData = (data) => ({
  type:'save_filter_data',
  payload: data
})

export const savePeakIdentData = (data) => ({
  type:'save_peak_identified',
  payload: data
})

export const saveComputedData = (data) => ({
  type:'save_computed',
  payload: data
})

export const clearStore = {
  type: 'clear'
}

