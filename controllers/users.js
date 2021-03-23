const admin = require('firebase-admin');
const asyncHandler = require('../middlewares/async')

function mapUser(user) {
    const customClaims = (user.customClaims || { role: '' });
    const role = customClaims.role ? customClaims.role : '';
    return {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        role,
        lastSignInTime: user.metadata.lastSignInTime,
        creationTime: user.metadata.creationTime
    }
}

function handleError(res, err) {
    return res.status(500).send({ message: `${err.code} - ${err.message}` });
 }



exports.createUser =  asyncHandler(async function (req, res){
    try {
       const { displayName, password, email, role } = req.body;

       if (!displayName || !password || !email || !role) {
           return res.status(400).send({ message: 'Missing fields' });
       }

       const { uid } = await admin.auth().createUser({
           displayName,
           password,
           email
       });

       await admin.auth().setCustomUserClaims(uid, { role });

       return res.status(201).json({ uid });

    } catch (error) {
        return handleError(res, error);
    }
});

exports.getAllUsers = asyncHandler( async function(req, res){
    try {
        const listUsers = await admin.auth().listUsers();
        const users = listUsers.users.map(mapUser);
        return res.status(200).json({ users });
    } catch (err) {
        return handleError(res, err);
    }
});

exports.getUser = asyncHandler( async function(req, res){
    try {
        const { id } = req.params;
        const user = await admin.auth().getUser(id);
        const currentUser = mapUser(user);
        return res.status(200).json({ user: currentUser, msg:"Fetched user" });
    } catch (err) {
        return handleError(res, err);
    }
});

exports.updateUser = asyncHandler(async function(req, res){
    try {
        const { id } = req.params;
        const { displayName, email, role } = req.body;
 
        if (!id || !displayName || !email || !role) {
            return res.status(400).json(
                { message: 'Missing fields' });
        }
 
        await admin.auth().updateUser(id, { displayName, email });
        await admin.auth().setCustomUserClaims(id, { role });
        const user = await admin.auth().getUser(id);
        const currentUser = mapUser(user);
        return res.status(200).json({ user: currentUser, msg: "Updated user" });
    } catch (err) {
        return handleError(res, err);
    }
});

exports.deleteUser = asyncHandler( async function(req, res){
    try {
        const { id } = req.params;
        await admin.auth().deleteUser(id);
        return res.status(200).json({
            message: "User removed"
        });
    } catch (err) {
        return handleError(res, err);
    }
});
