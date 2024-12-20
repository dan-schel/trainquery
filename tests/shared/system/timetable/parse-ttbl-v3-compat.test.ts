import { expect, describe, it } from "vitest";
import { parseTtblV3Compat } from "../../../../shared/system/timetable/parse-ttbl-v3-compat";
import { QDayOfWeek } from "../../../../shared/qtime/qdayofweek";
import { FullTimetableEntry } from "../../../../shared/system/timetable/timetable";

const str = `
[timetable]
version: 3.5
id: 3
line: 3
type: main
begins: *
ends: *
created: 2023-10-02

[up, MTWT___]
0259 stony-point 05:37  06:15  07:58  09:48  11:23  12:09  13:49  15:29  17:20  19:38
0071 crib-point  05:39  06:17  08:00  09:50  11:25  12:11  13:51  15:31  17:22  19:40
0191 morradoo    05:42  06:20  08:03  09:53  11:28  12:14  13:54  15:34  17:25  19:43
0033 bittern     05:45  06:23  08:06  09:56  11:31  12:17  13:57  15:37  17:28  19:46
0125 hastings    05:48  06:26  08:09  09:59  11:34  12:20  14:00  15:40  17:31  19:49
0279 tyabb       05:53  06:31  08:14  10:04  11:39  12:25  14:05  15:45  17:36  19:54
0248 somerville  05:58  06:36  08:19  10:09  11:44  12:30  14:10  15:50  17:41  19:59
0022 baxter      06:02  06:40  08:23  10:13  11:48  12:34  14:14  15:54  17:45  20:03
0158 leawarra    06:08  06:46  08:29  10:19  11:54  12:40  14:20  16:00  17:51  20:09
0106 frankston   06:14  06:52  08:35  10:25  12:00  12:46  14:26  16:06  17:56  20:14

[down, MTWT___]
0106 frankston   07:04  08:48  10:37  12:56  14:36  16:16  18:04  18:38
0158 leawarra    07:06  08:50  10:39  12:58  14:38  16:18  18:06  18:40
0022 baxter      07:13  08:57  10:46  13:05  14:45  16:25  18:13  18:47
0248 somerville  07:17  09:01  10:50  13:09  14:49  16:29  18:17  18:51
0279 tyabb       07:21  09:05  10:54  13:13  14:53  16:33  18:21  18:55
0125 hastings    07:26  09:10  10:59  13:18  14:58  16:38  18:26  19:00
0033 bittern     07:30  09:14  11:03  13:22  15:02  16:42  18:30  19:04
0191 morradoo    07:33  09:17  11:06  13:25  15:05  16:45  18:33  19:07
0071 crib-point  07:36  09:20  11:09  13:28  15:08  16:48  18:36  19:10
0259 stony-point 07:40  09:24  11:13  13:32  15:12  16:52  18:40  19:14

[up, ____F__]
0259 stony-point 05:37  06:15  07:58  09:48  11:23  12:09  13:49  15:29  17:20  19:38  21:00  22:23
0071 crib-point  05:39  06:17  08:00  09:50  11:25  12:11  13:51  15:31  17:22  19:40  21:02  22:25
0191 morradoo    05:42  06:20  08:03  09:53  11:28  12:14  13:54  15:34  17:25  19:43  21:05  22:28
0033 bittern     05:45  06:23  08:06  09:56  11:31  12:17  13:57  15:37  17:28  19:46  21:08  22:31
0125 hastings    05:48  06:26  08:09  09:59  11:34  12:20  14:00  15:40  17:31  19:49  21:11  22:34
0279 tyabb       05:53  06:31  08:14  10:04  11:39  12:25  14:05  15:45  17:36  19:54  21:16  22:39
0248 somerville  05:58  06:36  08:19  10:09  11:44  12:30  14:10  15:50  17:41  19:59  21:21  22:44
0022 baxter      06:02  06:40  08:23  10:13  11:48  12:34  14:14  15:54  17:45  20:03  21:25  22:48
0158 leawarra    06:08  06:46  08:29  10:19  11:54  12:40  14:20  16:00  17:51  20:09  21:31  22:54
0106 frankston   06:14  06:52  08:35  10:25  12:00  12:46  14:26  16:06  17:56  20:14  21:37  22:59

[down, ____F__]
0106 frankston   07:04  08:48  10:37  12:56  14:36  16:16  18:04  18:38  20:19  21:42
0158 leawarra    07:06  08:50  10:39  12:58  14:38  16:18  18:06  18:40  20:21  21:44
0022 baxter      07:13  08:57  10:46  13:05  14:45  16:25  18:13  18:47  20:28  21:51
0248 somerville  07:17  09:01  10:50  13:09  14:49  16:29  18:17  18:51  20:32  21:55
0279 tyabb       07:21  09:05  10:54  13:13  14:53  16:33  18:21  18:55  20:36  21:59
0125 hastings    07:26  09:10  10:59  13:18  14:58  16:38  18:26  19:00  20:41  22:04
0033 bittern     07:30  09:14  11:03  13:22  15:02  16:42  18:30  19:04  20:45  22:08
0191 morradoo    07:33  09:17  11:06  13:25  15:05  16:45  18:33  19:07  20:48  22:11
0071 crib-point  07:36  09:20  11:09  13:28  15:08  16:48  18:36  19:10  20:51  22:14
0259 stony-point 07:40  09:24  11:13  13:32  15:12  16:52  18:40  19:14  20:55  22:18

[up, _____S_]
0259 stony-point 07:39  09:19  11:09  12:49  14:49  16:28  18:39  20:19
0071 crib-point  07:41  09:21  11:11  12:51  14:51  16:30  18:41  20:21
0191 morradoo    07:44  09:24  11:14  12:54  14:54  16:33  18:44  20:24
0033 bittern     07:47  09:27  11:17  12:57  14:57  16:36  18:47  20:27
0125 hastings    07:50  09:30  11:20  13:00  15:00  16:39  18:50  20:30
0279 tyabb       07:55  09:35  11:25  13:05  15:05  16:44  18:55  20:35
0248 somerville  08:00  09:40  11:30  13:10  15:10  16:49  19:00  20:40
0022 baxter      08:04  09:44  11:34  13:14  15:14  16:53  19:04  20:44
0158 leawarra    08:10  09:50  11:40  13:20  15:20  16:59  19:10  20:50
0106 frankston   08:15  09:55  11:45  13:25  15:25  17:04  19:15  20:55

[down, _____S_]
0106 frankston   06:48  08:27  10:07  11:57  14:07  15:37  17:17  19:27
0158 leawarra    06:50  08:29  10:09  11:59  14:09  15:39  17:19  19:29
0022 baxter      06:57  08:36  10:16  12:06  14:16  15:46  17:26  19:36
0248 somerville  07:01  08:40  10:20  12:10  14:20  15:50  17:30  19:40
0279 tyabb       07:05  08:44  10:24  12:14  14:24  15:54  17:34  19:44
0125 hastings    07:10  08:49  10:29  12:19  14:29  15:59  17:39  19:49
0033 bittern     07:14  08:53  10:33  12:23  14:33  16:03  17:43  19:53
0191 morradoo    07:17  08:56  10:36  12:26  14:36  16:06  17:46  19:56
0071 crib-point  07:20  08:59  10:39  12:29  14:39  16:09  17:49  19:59
0259 stony-point 07:24  09:03  10:43  12:33  14:43  16:13  17:53  20:03

[up, ______S]
0259 stony-point 08:19  10:16  11:59  14:09  15:59  18:20  20:20
0071 crib-point  08:21  10:18  12:01  14:11  16:01  18:22  20:22
0191 morradoo    08:24  10:21  12:04  14:14  16:04  18:25  20:25
0033 bittern     08:27  10:24  12:07  14:17  16:07  18:28  20:28
0125 hastings    08:30  10:27  12:10  14:20  16:10  18:31  20:31
0279 tyabb       08:35  10:32  12:15  14:25  16:15  18:36  20:36
0248 somerville  08:40  10:37  12:20  14:30  16:20  18:41  20:41
0022 baxter      08:44  10:41  12:24  14:34  16:24  18:45  20:45
0158 leawarra    08:50  10:47  12:30  14:40  16:30  18:51  20:51
0106 frankston   08:55  10:52  12:35  14:45  16:35  18:56  20:56

[down, ______S]
0106 frankston   07:27  09:27  11:07  13:07  15:07  17:17  19:27
0158 leawarra    07:29  09:29  11:09  13:09  15:09  17:19  19:29
0022 baxter      07:36  09:36  11:16  13:16  15:16  17:26  19:36
0248 somerville  07:40  09:40  11:20  13:20  15:20  17:30  19:40
0279 tyabb       07:44  09:44  11:24  13:24  15:24  17:34  19:44
0125 hastings    07:49  09:49  11:29  13:29  15:29  17:39  19:49
0033 bittern     07:53  09:53  11:33  13:33  15:33  17:43  19:53
0191 morradoo    07:56  09:56  11:36  13:36  15:36  17:46  19:56
0071 crib-point  07:59  09:59  11:39  13:39  15:39  17:49  19:59
0259 stony-point 08:03  10:03  11:43  13:43  15:43  17:53  20:03
`;

describe("parseTtblV3Compat", () => {
  it("works correctly", () => {
    const timetable = parseTtblV3Compat(str);
    if (timetable == null) {
      throw new Error("Expected timetable to be defined.");
    }

    expect(timetable.id).toBe(3);
    expect(timetable.line).toBe(3);
    expect(timetable.isTemporary).toBe(false);
    expect(timetable.begins).toBeNull();
    expect(timetable.ends).toBeNull();
    expect(timetable.created.toISO()).toBe("2023-10-02");

    const isUp = (x: FullTimetableEntry) => x.direction === "up";
    const isDown = (x: FullTimetableEntry) => x.direction === "down";
    const isSunday = (x: FullTimetableEntry) =>
      x.weekdayRange.includes(QDayOfWeek.sun);

    expect(timetable.entries.length).toBe(70);
    expect(timetable.entries.filter(isUp).length).toBe(37);
    expect(timetable.entries.filter(isDown).length).toBe(33);
    expect(timetable.entries.filter(isSunday).length).toBe(14);
  });
});
