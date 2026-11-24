use std::time::Duration;

pub fn count_u32(count: usize) -> u32 {
	u32::try_from(count).unwrap_or(u32::MAX)
}

pub fn count_i64(count: usize) -> i64 {
	i64::try_from(count).unwrap_or(i64::MAX)
}

pub fn millis_u64(duration: Duration) -> u64 {
	u64::try_from(duration.as_millis()).unwrap_or(u64::MAX)
}

pub fn millis_i64(duration: Duration) -> i64 {
	i64::try_from(duration.as_millis()).unwrap_or(i64::MAX)
}

pub fn size_i64(size: u64) -> i64 {
	i64::try_from(size).unwrap_or(i64::MAX)
}
