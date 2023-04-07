import time 

def myfunc():
    now=time.time()
    timer = 0
    while timer != 10:
        end = time.time()
        timer = round(end-now)
        
        
myfunc()