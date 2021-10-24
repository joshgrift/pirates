
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use std::{thread};
extern crate redis;

static TICK:u128 = 50;

fn main() {
    let mut last_tick:Duration = Duration::new(1,0);

    let client = redis::Client::open("redis://127.0.0.1/").unwrap();
    let mut con = client.get_connection().unwrap();

    loop {
        let now = get_now();
        if now.as_millis() - last_tick.as_millis() >= TICK {
            last_tick = now;
            let count = get_count(&mut con).unwrap();
            print!("{} : {}\n",count,get_now().as_millis());

            
            thread::sleep(Duration::from_millis(count as u64));
            print!("finished at {}\n",get_now().as_millis());
            
        }
    }
    
}

fn get_now() -> Duration {
    return SystemTime::now().duration_since(UNIX_EPOCH).unwrap();
}

fn get_count(con: &mut redis::Connection) -> redis::RedisResult<isize> {
    let ok = redis::cmd("GET").arg("count").query(con)?;
    Ok(ok)
}