def compute_uncertainty(value,basic_range,mV=False):
    result = 0.012/100.*value+0.004/100.*basic_range
    if (mV):
        return str(result*1e3)+"mV" 
    return result 
print compute_uncertainty(1.6,10,True)
print compute_uncertainty(11.42,100,True)
print compute_uncertainty(0.0149e-3,0.01e-3,True)

