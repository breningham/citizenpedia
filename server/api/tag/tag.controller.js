/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/tags              ->  index
 * POST    /api/tags              ->  create
 * GET     /api/tags/:id          ->  show
 * PUT     /api/tags/:id          ->  upsert
 * PATCH   /api/tags/:id          ->  patch
 * DELETE  /api/tags/:id          ->  destroy
 */

'use strict';

//import jsonpatch from 'fast-json-patch';
import Tag from './tag.model';
import Question from '../question/question.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if(entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function(entity) {
    try {
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch(err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function(entity) {
    if(entity) {
      return entity.remove()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if(!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Tags
export function index(req, res) {
  return Tag.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
  }

// Gets a single Tag from the DB
export function show(req, res) {
  console.log("Search by tag");
  var query = req.params.id;
  console.log(query);
  Question.find({"tags.text": query}).sort({createdAt: -1}).limit(20).execAsync()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Tag from the DB
export function findByName(req, res) {
  var query = req.params.query;

  Tag.find({"name": new RegExp(query, 'i')}).sort({createdAt: -1}).limit(20).execAsync()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Tag in the DB
export function create(req, res) {
  return Tag.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Tag in the DB at the specified ID
export function upsert(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Tag.findOneAndUpdate({_id: req.params.id}, req.body, {new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true}).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Tag in the DB
export function patch(req, res) {
  if(req.body._id) {
    delete req.body._id;
  }
  return Tag.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Tag from the DB
export function destroy(req, res) {
  return Tag.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

/**
 * Modify tag
 */
export function updateTag(req, res, next) {
  // db.users.update({"_id" : ObjectId("58e4b8c142984807893801a3")},{$set:{"role":"admin"}})

      console.log("Update tag");
      console.log("======");
      console.log(req.params.id);
      console.log(req.params.name);

  Tag.update({"_id": req.params.id},{$set:{"name":req.params.name}})
    .then(respondWithResult(res))
    .catch(handleError(res));
  //res.redirect(config.path +'/tagsIndex');
}