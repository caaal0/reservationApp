import db from '../firebase.js';

const getSeats = async (req, res) => {
    // res.status(200).send(seats);
    try{
        const seatsRef = db.collection('seats');
        const response = await seatsRef.get();
        let seatsArr = [];

        response.forEach(doc => {
            seatsArr.push(doc.data());
        });

        // console.log(seatsArr.find(seat => seat.seatNo === '1'));
        res.send(seatsArr);

    }catch (err){
        res.send({ success: false, msg: 'Unable to get seats', error: err.message });
    }
}

const getSeat = async (req, res) => {

    try{
        const { seatNo } = req.params;
        const seatRef = db.collection('seats').doc(seatNo);
        const response = await seatRef.get();

        if(!response.exists){
            throw new Error('Seat not found');
        }

        res.send(response.data());

    }catch (err){
        res.send({ success: false, msg: 'Unable to get seats', error: err.message });
    }
}

export default {
    getSeats,
    getSeat
}