const axios = require('axios');
const mqtt = require('mqtt');
const mqtt_publisher = mqtt.connect('wss://auoh-mqtt-broker.herokuapp.com');

const main_loop = () => {
    setTimeout(() => {
        let start_time_stamp = new Date();

        axios.get('https://fanuc-robot-http-server.herokuapp.com/')
            .then((res) => {
                const time_stamp = new Date();
                const delta = time_stamp - start_time_stamp;
                start_time_stamp = time_stamp;
                const regexp = 'Joint   [1-6]: *(-?.*)';
                let joints = [];
                let matches = res.data.matchAll(regexp);
                let count = 0;
                for (const match of matches) {
                    count++;
                    if (count > 6) break;
                    const value = parseFloat(match[1]);
                    joints.push(value);
                }
                console.log(start_time_stamp, joints, delta, 'ms');
                mqtt_publisher.publish('joints', JSON.stringify(joints));
                main_loop();
            });
    }, 10);
}

mqtt_publisher.on('connect', () => {
    console.log('connected to mqtt broker');
    main_loop();
});